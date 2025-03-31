import "./index.css";
import { useState, useRef, useEffect } from "react";

export function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("Alle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanResults, setScanResults] = useState<Array<{fileName: string, analysis: any, text: string}>>([]);
  const [scanning, setScanning] = useState(false);
  const [labeledDocuments, setLabeledDocuments] = useState<Array<{
    fileName: string;
    fileType: string;
    uploadDate: string;
    labels: string[];
  }>>([]);

  // Valg av filtyper
  const fileTypeOptions = [
    { value: "Alle", label: "Alle Filtyper", accept: "*/*" },
    { value: "Dokumenter", label: "Dokumenter", accept: ".pdf,.doc,.docx,.txt,.rtf,.odt" },
    { value: "Bilder", label: "Bilder", accept: ".jpg,.jpeg,.png,.gif,.bmp,.webp" },
  ];

  // Hent nåværende filtype
  const getAcceptAttribute = () => {
    return fileTypeOptions.find(option => option.value === fileTypeFilter)?.accept || "*/*";
  };

  // Nullstill filer når filtype filteret endres
  useEffect(() => {
    clearFiles();
  }, [fileTypeFilter]);

  // Endre filer når filinput endres
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    
    // Generer mock-etiketter for dokumenter for visning
    const newLabeledDocs = selectedFiles.map(file => ({
      fileName: file.name,
      fileType: file.type || 'unknown',
      uploadDate: new Date().toLocaleString(),
      labels: generateMockLabels(file.name)
    }));
    
    // Legg til eksisterende dokumenter
    setLabeledDocuments(prev => [...prev, ...newLabeledDocs]);
  };

    // Endre filtype filteret når filtype validator endres
  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFileTypeFilter(e.target.value);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus("Velg minst en fil for å laste opp");
      return;
    }

    setUploading(true);
    setScanResults([]);
    
    try {
      // Prossesser filer en etter en med Databie
      const results = await Promise.all(
        files.map(file => processFileWithDatabie(file))
      );
      
      // Fjern alle null resultater (feil prosessering)
      const validResults = results.filter(result => result !== null);
      setScanResults(validResults as any[]);
      
      setUploadStatus(`Analysert ${validResults.length} av ${files.length} fil(er) med Databie`);
    } catch (error) {
      setUploadStatus("Feil ved opplasting eller analyse. Vennligst prøv igjen.");
      console.error("Feil:", error);
    } finally {
      setUploading(false);
    }
  };

  const processFileWithDatabie = async (file: File) => {
    try {
      setScanning(true);
      
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch('http://localhost:3001/api/process-file', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Processing failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      return null;
    } finally {
      setScanning(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setUploadStatus(null);
    setScanResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  // Hjelpefunksjon for å hente nøkkelbegreper fra analyseresultatet
  const extractLabels = (analysis: any): string[] => {
    if (!analysis) return [];
    
    try {
      const keys = Object.keys(analysis);
      return keys.filter(key => 
        typeof analysis[key] === 'string' && 
        analysis[key] !== 'undefined' &&
        analysis[key].trim() !== ''
      );
    } catch (e) {
      console.error("Error extracting labels:", e);
      return [];
    }
  };

  const renderDocumentWithLabels = (result: {fileName: string, analysis: {summary: string, key_points: string[], categories: string[], recommendations: string}, text: string}) => {
    if (!result) return null;
    
    const categories = result.analysis.categories || [];
    
    const highlightedText = categories.reduce((text: string, category: string) => {
      const regex = new RegExp(`\\b${category}\\b`, 'gi');
      return text.replace(regex, `<span class="highlighted-category">${category}</span>`);
    }, result.text);
    
    return (
      <div className="document-display">
        <h3>Dokument: {result.fileName}</h3>
        <div className="document-metadata">
          <h4>Dokumentanalyse:</h4>
          <p><strong>Sammendrag:</strong> {result.analysis.summary}</p>
          
          <h5>Nøkkelpunkter:</h5>
          <ul>
            {result.analysis.key_points.map((point: string, index: number) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
          
          <h5>Kategorier:</h5>
          <div className="category-tags">
            {categories.map((category: string, index: number) => (
              <span key={index} className="category-tag">{category}</span>
            ))}
          </div>
          
          <h5>Anbefalinger:</h5>
          <p>{result.analysis.recommendations}</p>
        </div>
        
        <div className="document-content">
          <h4>Dokumentinnhold:</h4>
          <div 
            className="text-content"
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
        </div>
      </div>
    );
  };

  const generateMockLabels = (fileName: string) => {
    // Mock labels basert på filutvidelse
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mockLabels = [];
    
    // Generer noen kontekstbaserte mock labels
    if (extension === 'pdf' || extension === 'doc' || extension === 'docx') {
      mockLabels.push('Dokument');
      
      // Legg til noen tilfeldig skattrelaterte labels
      const taxLabels = ['Skattemelding', 'Næringsoppgave', 'MVA-oppgave', 'Selvangivelse', 'Fradrag'];
      mockLabels.push(taxLabels[Math.floor(Math.random() * taxLabels.length)]);
    } else if (extension === 'jpg' || extension === 'png' || extension === 'jpeg') {
      mockLabels.push('Bilde');
      mockLabels.push('Dokumentasjon');
    } else {
      mockLabels.push('Annet');
    }
    
    // Legg til tilfeldig klassifiseringslabel
    const classifications = ['Konfidensielt', 'Internt', 'Offentlig'];
    mockLabels.push(classifications[Math.floor(Math.random() * classifications.length)]);
    
    return mockLabels;
  };

  const renderDocumentList = () => {
    if (labeledDocuments.length === 0) return null;
    
    return (
      <div className="document-list-container">
        <h2>Opplastede dokumenter</h2>
        <div className="document-list">
          {labeledDocuments.map((doc, index) => (
            <div key={index} className="document-item">
              <div className="document-icon">
                {getDocumentIcon(doc.fileName)}
              </div>
              <div className="document-info">
                <div className="document-name">{doc.fileName}</div>
                <div className="document-meta">Lastet opp: {doc.uploadDate}</div>
              </div>
              <div className="document-labels">
                {doc.labels.map((label, labelIndex) => (
                  <span key={labelIndex} className="document-label">{label}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getDocumentIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return <span>📄</span>;
      case 'doc':
      case 'docx':
        return <span>��</span>;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <span>🖼️</span>;
      default:
        return <span>📁</span>;
    }
  };

  return (
    <div>
      <h1>Dokumentopplasting</h1>
      
      <div className="uploadContainer">
        <div className="fileTypeSelector">
          <label htmlFor="file-type">Filtype:</label>
          <select 
            id="file-type" 
            value={fileTypeFilter} 
            onChange={handleFileTypeChange}
            disabled={uploading || scanning}
          >
            {fileTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <input
          type="file"
          id="file-upload"
          multiple
          accept={getAcceptAttribute()}
          onChange={handleFileChange}
          disabled={uploading || scanning}
          className="fileInput"
          ref={fileInputRef}
        />
        <label htmlFor="file-upload" className="fileLabel">
          Trykk her for å laste opp en fil
        </label>
        
        {files.length > 0 && (
          <div className="fileList">
            <div className="fileListHeader">
              <h3>Valgte filer</h3>
              <button 
                onClick={clearFiles} 
                className="clearButton"
                disabled={uploading || scanning}
              >
                Slett alle
              </button>
            </div>
            <ul>
              {files.map((file, index) => (
                <li key={index}>
                  <div className="fileInfo">
                    <span className="fileName">{file.name}</span>
                    <span className="fileSize">{formatFileSize(file.size)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <button 
          onClick={handleUpload} 
          disabled={uploading || scanning || files.length === 0}
          className="uploadButton"
        >
          {uploading || scanning ? "Analyserer..." : "Last opp og analyser"}
        </button>
        
        {uploadStatus && (
          <div className={`statusMessage ${uploadStatus.includes("Feil") || uploadStatus.includes("Vennligst") ? "error" : ""}`}>
            {uploadStatus}
          </div>
        )}
        
        <div className="results-container">
          {scanResults.length > 0 && (
            <div>
              <h2>Analyseresultater</h2>
              {scanResults.map((result, index) => (
                <div key={index} className="result-item">
                  {renderDocumentWithLabels(result)}
                </div>
              ))}
            </div>
          )}
        </div>

        {renderDocumentList()}
      </div>
    </div>
  );
}

export default App;

import express from 'express';
import { Client } from '@gradio/client';
import multer from 'multer';
import cors from 'cors';

const app = express();
const port = 3001;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Handle file upload and analysis
app.post('/api/process-file', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    // MOCK RESPONSE: Instead of calling Databie API
    // Create a mock successful response
    const mockResponse = {
      fileName: file.originalname,
      analysis: {
        summary: "Dette er et dokument som omhandler skatteregler og fradrag for næringsdrivende. Dokumentet gir detaljert informasjon om hvilke utgifter som kan føres som fradrag i næringsvirksomhet, samt relevant lovgivning og forskrifter.",
        key_points: [
          "Fradragsberettigede utgifter i næringsvirksomhet",
          "Dokumentasjonskrav for fradrag",
          "Skatteregler for enkeltpersonforetak",
          "Merverdiavgift og avgiftspliktig omsetning",
          "Skattemessige avskrivninger"
        ],
        categories: ["Skatt", "Næring", "Fradrag", "Merverdiavgift"],
        recommendations: "Dokumentet bør arkiveres under 'Skattelovgivning for næringsdrivende' og kan brukes som oppslagsverk for veiledning."
      },
      text: "Dette dokumentet inneholder retningslinjer og regler for skattefradrag i næringsvirksomhet. § 6-1 i skatteloven gir hjemmel for fradrag for kostnader som er pådratt for å erverve, vedlikeholde eller sikre skattepliktig inntekt.\n\nNæringsdrivende kan kreve fradrag for utgifter som er relevante og nødvendige for virksomheten. Dette inkluderer blant annet:\n- Kontorkostnader\n- Driftsmidler (med avskrivningsregler)\n- Varekostnader\n- Lønnskostnader\n- Markedsføring\n\nMerk at private utgifter ikke er fradragsberettiget. Ved blandet bruk av driftsmidler må det foretas en fordeling mellom næring og privat bruk."
    };

    res.json(mockResponse);
    
    /*
    // Connect to Databie
    const client = await Client.connect("https://databie.innovasjon.skatteetaten-it.no/");
    
    // Upload file
    const uploadResult = await client.predict("/upload_file", {
      filepath: file.buffer,
      uploaded_files: "{'files': []}"
    });
    
    // Extract file content
    const fileContent = uploadResult.data[1];
    const numPages = uploadResult.data[2];
    
    // Analyze the text
    const analysisResult = await client.predict("/analyze_text", {
      prompt: "Du er en nøyaktig assistent som analyserer et dokument og henter ut nøkkelkonsepter og temaer.",
      definitions: {"headers":["Navn","Beskrivelse"],"data":[["",""]]},
      schema: {"headers":["Begrep","Definisjon"],"data":[["",""]]},
      text: fileContent,
      num_pages: numPages
    });
    
    // Return the results
    res.json({
      fileName: file.originalname,
      analysis: analysisResult.data[0],
      text: fileContent
    });
    */
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send(`Error processing file: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
}); 
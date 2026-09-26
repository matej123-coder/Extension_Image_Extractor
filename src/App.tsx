import { useState } from "react";
import { loadPdf } from "./pdf/loadPdf";
function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] || null;
    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      const pdf = await loadPdf(selectedFile);

      console.log("Loaded PDF:", pdf);
    } catch (error) {
      console.error("Failed to load PDF:", error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <div>
        <h1>PDF Image Extractor</h1>

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />

        {file && <p>Selected: {file.name}</p>}

        {loading && <p>Loading PDF...</p>}
      </div>
    </>
  );
}

export default App;

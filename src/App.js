import React, { useState } from "react";
import axios from "axios";
import JSZip from "jszip";
import { openDB } from "idb";

const App = () => {
    const [status, setStatus] = useState("");
    const [extractedFiles, setExtractedFiles] = useState([]);

    const DB_NAME = "FileStorageDB";
    const STORE_NAME = "extractedFiles";

    // Initialize IndexedDB
    const initDB = async () => {
        return openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: "id" });
                }
            },
        });
    };

    // Fetch and extract ZIP file
    const fetchAndExtractZip = async () => {
        const fileId = "deahistfo2024";

        try {
            setStatus("Checking if file already exists...");
            const db = await initDB();
            const existingFile = await db.get(STORE_NAME, fileId);

            if (existingFile) {
                setStatus("File already exists. Loading from local storage...");
                setExtractedFiles([existingFile]);
                return;
            }

            setStatus("Downloading ZIP file...");
            const response = await axios.get(
                "https://www.cftc.gov/sites/default/files/files/dea/history/deahistfo2024.zip",
                { responseType: "arraybuffer" }
            );

            setStatus("Extracting ZIP file...");
            const zip = await JSZip.loadAsync(response.data);
            const files = [];
            
            for (const filename of Object.keys(zip.files)) {
                if (filename.endsWith(".txt")) {
                    const fileContent = await zip.files[filename].async("text");
                    files.push({ name: filename, content: fileContent });
                    
                    // Save to IndexedDB
                    await db.put(STORE_NAME, {
                        id: fileId,
                        filename: filename,
                        content: fileContent,
                        timestamp: new Date().toISOString(),
                    });
                }
            }

            setExtractedFiles(files);
            setStatus("ZIP file extracted and saved successfully.");
        } catch (error) {
            console.error("Error handling ZIP file:", error);
            setStatus("Failed to fetch or extract the ZIP file.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>ZIP File Extractor</h1>

            <button onClick={fetchAndExtractZip} style={{ padding: "10px 20px" }}>
                Fetch and Extract ZIP
            </button>

            <div style={{ marginTop: "20px", color: "blue" }}>{status}</div>

            <div style={{ marginTop: "20px" }}>
                <h2>Extracted Files</h2>
                <ul>
                    {extractedFiles.map((file, index) => (
                        <li key={index}>
                            <strong>{file.name}</strong>
                            <pre
                                style={{
                                    background: "#f4f4f4",
                                    border: "1px solid #ccc",
                                    padding: "10px",
                                    maxHeight: "300px",
                                    overflowY: "auto",
                                }}
                            >
                                {file.content.substring(0, 500)}... {/* Display a preview */}
                            </pre>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default App;

import type { Images } from "../types/types";

interface Props {
    images: Images[];
    setSelectedImages: React.Dispatch<React.SetStateAction<Images[]>>;
    fileName: string | null;
    handleFormatValue: (event: React.ChangeEvent<HTMLSelectElement>, index: number) => void;
    setPreviewIndex: React.Dispatch<React.SetStateAction<number | null>>;
    handleDownloadImage: (index: number) => Promise<void>;
    totalPages: number | null,
    handleDownloadSelectedImages: () => Promise<void>;
    selectedImages: Images[];
    handleDownloadAllImages: () => Promise<void>;
    handleBackToExtraction: () => Promise<void>;
}
export default function ExtractionResult({ images, setSelectedImages, setPreviewIndex, handleFormatValue, handleDownloadImage, totalPages, fileName, handleDownloadSelectedImages, selectedImages, handleDownloadAllImages,handleBackToExtraction }: Props) {

  
    return (
        <div className="input-field">
            <div className="extraction-summary">
                <div className="extraction-summary-header">
                    <div className="completion-icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M5 12L10 17L20 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <div className="extraction-summary-title">
                        <h2>Extraction Completed</h2>
                        <p>Your PDF has been successfully processed.</p>
                    </div>
                </div>

                <div className="extraction-summary-details">
                    <div className="summary-detail">
                        <span className="summary-label">File Name</span>
                        <span className="summary-value" title={fileName ?? ""}>
                            {fileName || "Unknown PDF"}
                        </span>
                    </div>

                    <div className="summary-detail">
                        <span className="summary-label">Total Pages</span>
                        <span className="summary-value">{totalPages ?? 0}</span>
                    </div>

                    <div className="summary-detail">
                        <span className="summary-label">Images Extracted</span>
                        <span className="summary-value">{images.length}</span>
                    </div>
                </div>
            </div>
            <div className="image-section">
                <div className="header">
                    <h1>All Images</h1>
                    <div className="download-btn-all">
                        <button
                            onClick={handleDownloadSelectedImages}
                            className="download-btn selected-images"
                            disabled={selectedImages.length === 0}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="800px"
                                height="800px"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M17 17H17.01M17.4 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H6.6M12 15V4M12 15L9 12M12 15L15 12"
                                    stroke="white"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>{" "}
                            Download Selected
                        </button>
                        <button
                            onClick={handleDownloadAllImages}
                            className="download-btn"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="800px"
                                height="800px"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M17 17H17.01M17.4 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H6.6M12 15V4M12 15L9 12M12 15L15 12"
                                    stroke="white"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>{" "}
                            Download All
                        </button>
                    </div>
                </div>

                <div className="image-table-container">
                    <table className="image-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Index</th>
                                <th>Preview</th>
                                <th>Width</th>
                                <th>Height</th>
                                <th>Type</th>
                                <th>Page No.</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {images.map((image, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="select-checkbox"
                                            onChange={(event) => {
                                                const { checked } = event.target;

                                                setSelectedImages((prev) =>
                                                    checked
                                                        ? [...prev, image]
                                                        : prev.filter(
                                                            (selectImage) =>
                                                                selectImage.pageNumber !==
                                                                image.pageNumber ||
                                                                selectImage.paintIndex !==
                                                                image.paintIndex,
                                                        ),
                                                );
                                            }}
                                        />
                                    </td>
                                    <td>{index + 1}</td>
                                    <td className="image-preview-cell">
                                        <img
                                            src={image.imageUrl}
                                            alt={`Extracted image ${index + 1}`}
                                        />
                                    </td>

                                    <td>{image.width}px</td>
                                    <td>{image.height}px</td>
                                    <td>{image.imageType.toUpperCase()}</td>
                                    <td>{image.pageNumber}</td>

                                    <td>
                                        <div className="image-actions">
                                            <button
                                                className="preview-btn"
                                                onClick={() => {
                                                    setPreviewIndex(index);
                                                }}
                                            >
                                                Preview
                                            </button>

                                            <div className="download-actions">
                                                <select
                                                    name="selectFormat"
                                                    id="selectFormat"
                                                    aria-label={`Output format for image ${index + 1}`}
                                                    value={image.imageType.toLowerCase()}
                                                    onChange={(event) =>
                                                        handleFormatValue(event, index)
                                                    }
                                                >
                                                    <option value="png">PNG</option>
                                                    <option value="jpeg">JPEG</option>
                                                    <option value="webp">WEBP</option>
                                                </select>

                                                <button
                                                    className="download-btn"
                                                    onClick={() => handleDownloadImage(index)}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="800px"
                                                        height="800px"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M17 17H17.01M17.4 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H6.6M12 15V4M12 15L9 12M12 15L15 12"
                                                            stroke="white"
                                                            stroke-width="2"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="back-to-extraction">
                    <button
                        onClick={handleBackToExtraction}
                        className="download-btn selected-images"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 571.815 571.815"
                            fill="currentColor"
                            stroke="white"
                            className="left-arrow"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M117.518,296.042l333.161,272.132c8.286,6.646,12.062,3.941,8.43-6.04l-88.442-260.049c-3.63-9.981-3.596-26.156,0.076-36.123l88.29-256.26c3.672-9.966-0.101-12.702-8.431-6.11L117.594,272.07C109.265,278.661,109.231,289.395,117.518,296.042z" />
                        </svg>
                        Back To Extraction
                    </button>
                </div>
            </div>

        </div>
    )
}

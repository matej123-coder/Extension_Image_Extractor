import type { PdfError } from "../types/types";

export default function getPdfErrorMessage(error: unknown): PdfError {
    if (error instanceof Error) {
        switch (error.name) {
            case "InvalidPDFException":
                return {
                    title: "Invalid PDF",
                    message: "The selected URL does not contain a valid PDF file.",
                };

            case "MissingPDFException":
                return {
                    title: "PDF Not Found",
                    message: "We couldn't find a PDF at the provided URL. The file may have been moved or deleted.",
                };

            case "UnexpectedResponseException":
            case "ResponseException":
                return {
                    title: "Unable to Access PDF",
                    message: "The server returned an unexpected response. The PDF may require authentication or may not be publicly accessible.",
                };

            case "PasswordException":
                return {
                    title: "Password Protected PDF",
                    message: "This PDF requires a password. Password-protected documents cannot currently be processed.",
                };

            default:
                break;
        }

        if (error instanceof TypeError) {
            return {
                title: "Connection Error",
                message: "We couldn't retrieve the PDF. Check your internet connection or verify that the server allows access to this file.",
            };
        }
    }

    return {
        title: "Unable to Load PDF",
        message: "Something went wrong while loading this PDF. Please verify the URL and try again.",
    };
}
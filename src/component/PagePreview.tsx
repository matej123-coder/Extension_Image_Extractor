import { useEffect, useRef } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { Images } from "../types/types";


const SCALE = 1.5;

interface Props {
    pdf: PDFDocumentProxy;
    images: Images[];
    selectedIndex: number;
    onClose: () => void;
}

export default function PagePreview({ pdf, images, selectedIndex, onClose }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const selected = images[selectedIndex];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let renderTask: ReturnType<
            Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]
        > | null = null;
        let cancelled = false;

        (async () => {
            const page = await pdf.getPage(selected.pageNumber);
            if (cancelled) return;

            const viewport = page.getViewport({ scale: SCALE });
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);

            renderTask = page.render({ canvas, viewport });
            try {
                await renderTask.promise;
            } catch {
                return; 
            }
            if (cancelled) return;
            const r = selected.position;
            if(!r) return;

            const ctx = canvas.getContext("2d")!;
            ctx.lineWidth = 3;
            ctx.font = "20px sans-serif";
            ctx.strokeStyle = ctx.fillStyle = "red";

            ctx.strokeRect(r.x * SCALE, r.y * SCALE, r.width * SCALE, r.height * SCALE);
            ctx.fillText(String(selectedIndex + 1), r.x * SCALE + 4, r.y * SCALE + 20);
            
            // images.forEach((img, i) => {
            //     if (img.pageNumber !== selected.pageNumber || !img.position) return;
            //     const r = img.position;
            //     const isSelected = i === selectedIndex;
            //     console.log(isSelected)
            //     if( isSelected){
            //     ctx.strokeStyle = ctx.fillStyle = isSelected ? "red" : "";
            //     ctx.strokeRect(r.x * SCALE, r.y * SCALE, r.width * SCALE, r.height * SCALE);
            //     ctx.fillText(String(i + 1), r.x * SCALE + 4, r.y * SCALE + 20);
            //      return;
            //     }
                
            // });
        })();

        return () => {
            cancelled = true;
            renderTask?.cancel();
        };
    }, [pdf, selected, selectedIndex]);

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
                overflow: "auto", display: "flex", justifyContent: "center",
                padding: 24, zIndex: 1000,
            }}
        >
            <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: 12 }}>
                <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                    <span>
                        Page {selected.pageNumber}, image {selectedIndex + 1} (red = selected, blue = others)
                    </span>
                    <button onClick={onClose}>Close</button>
                </div>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}
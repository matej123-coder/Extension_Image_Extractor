import { useCallback, useEffect, useRef } from "react";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import type { ImageRect, Images } from "../types/types";
import getImageCoordinates from "../pdf/getImageCoordinates";

const SCALE = 1.5;

interface Props {
    pdf: PDFDocumentProxy;
    images: Images[];
    selectedIndex: number;
    onClose: () => void;
    positionRef: React.RefObject<Map<string,ImageRect | null>>;
}

export default function PagePreview({ pdf, images, selectedIndex, onClose,positionRef }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const selected = images[selectedIndex];

    const assignAndGetTheImagePosition =  useCallback(async (page:PDFPageProxy)=>{
         const key = `${selectedIndex}-${selected.pageNumber}`;

        const positionCache = positionRef.current.get(key);

        if (positionCache) {
            return positionCache;
        }

        const { rects } = await getImageCoordinates(page);

        const position = rects[selected.paintIndex] ?? null;

        if (position) {
            positionRef.current.set(key, position);
        }

        return position;
    
    },[selected.pageNumber,selected.paintIndex,selectedIndex,positionRef])

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let renderTask: ReturnType<
            Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]
        > | null = null;
        let cancelled = false;

        (async () => {
            const page = await pdf.getPage(selected.pageNumber);

            const imagePosition = await assignAndGetTheImagePosition(page)

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
            const r = imagePosition;
            if(!r) return;

            const ctx = canvas.getContext("2d")!;
            ctx.lineWidth = 3;
            ctx.font = "20px sans-serif";
            ctx.strokeStyle = ctx.fillStyle = "red";

            ctx.strokeRect(r.x * SCALE, r.y * SCALE, r.width * SCALE, r.height * SCALE);
            ctx.fillText(String(selectedIndex + 1), r.x * SCALE + 4, r.y * SCALE + 20);
            
        })();

        return () => {
            cancelled = true;
            renderTask?.cancel();
        };
    }, [pdf, selected, selectedIndex, assignAndGetTheImagePosition]);

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
                overflow: "auto", display: "flex", justifyContent: "center",
                padding: 24, zIndex: 1000,
            }}
        >
            <div onClick={(e) => e.stopPropagation()} style={{  }}>
                <div style={{ marginBottom: 8, display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={onClose}>Close</button>
                </div>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}
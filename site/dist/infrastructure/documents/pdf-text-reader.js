const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/pdf.min.mjs';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/pdf.worker.min.mjs';
let pdfJsPromise = null;

async function loadPdfJs() {
    if (!pdfJsPromise) {
        pdfJsPromise = import(PDFJS_URL).then((pdfjs) => {
            pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
            return pdfjs;
        });
    }
    return pdfJsPromise;
}

function lineText(items) {
    const positioned = items
        .filter((item) => typeof item.str === 'string' && item.str.trim())
        .map((item) => ({ text: item.str.trim(), x: Number(item.transform?.[4] ?? 0), y: Number(item.transform?.[5] ?? 0) }))
        .sort((left, right) => Math.abs(right.y - left.y) > 2.5 ? right.y - left.y : left.x - right.x);
    const lines = [];
    for (const item of positioned) {
        let line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 2.5);
        if (!line) {
            line = { y: item.y, items: [] };
            lines.push(line);
        }
        line.items.push(item);
    }
    lines.sort((left, right) => right.y - left.y);
    return lines.map((line) => line.items.sort((a, b) => a.x - b.x).map((item) => item.text).join(' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
}

export async function extractPdfText(file) {
    if (!(file instanceof File) || file.type !== 'application/pdf')
        throw new TypeError('Selecione um arquivo PDF.');
    const pdfjs = await loadPdfJs();
    const data = new Uint8Array(await file.arrayBuffer());
    const loadingTask = pdfjs.getDocument({ data });
    const document = await loadingTask.promise;
    const pages = [];
    try {
        for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
            const page = await document.getPage(pageNumber);
            const content = await page.getTextContent();
            pages.push(lineText(content.items).join('\n'));
            page.cleanup();
        }
    }
    finally {
        await document.destroy();
    }
    const text = pages.join('\n').trim();
    if (!text)
        throw new TypeError('O PDF não possui texto pesquisável. Esta versão ainda não usa OCR para documentos digitalizados.');
    return text;
}

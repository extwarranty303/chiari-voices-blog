
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import DOMPurify from 'dompurify';

// The workerSrc property needs to be set to the path of the PDF.js worker script.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


/**
 * Parses a .docx file and converts it to sanitized HTML.
 * @param file The .docx file to parse.
 * @returns A promise that resolves with the sanitized HTML string.
 */
export const parseDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return DOMPurify.sanitize(result.value);
};

/**
 * Parses a .pdf file and extracts the text content as HTML.
 * @param file The .pdf file to parse.
 * @returns A promise that resolves with the text content as an HTML string.
 */
export const parsePdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let content = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    content += textContent.items.map((item: any) => item.str).join(' ');
  }

  return `<p>${content}</p>`;
};

import { useCallback, useEffect, useMemo, useState } from "react";
import { getIDcarddesign } from "../../Network/AdminApi";
import { toast } from "react-toastify";
import moment from "moment";

const FrontTemplate = ({ student }) => {

  const [idCardData, setIdCardData] = useState(null);
  const fetchTemplate = useCallback(async () => {
    try {
      const response = await getIDcarddesign();
      if (response?.success && response?.designFormats?.length > 0) {
        setIdCardData(response.designFormats[0]);
      } else {
        console.warn("No custom ID card design found. Using default.");
        setIdCardData(null);
      }
    } catch (error) {
      console.error("Error fetching ID card design:", error);
      toast.error("Could not load custom ID card template.");
      setIdCardData(null);
    }
  }, []);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const decodeBase64 = useCallback((encoded) => {
    try {
      if (!encoded || typeof encoded !== 'string') return null;
      let cleanEncoded = encoded;
      if (cleanEncoded.startsWith('"') && cleanEncoded.endsWith('"')) {
        cleanEncoded = cleanEncoded.slice(1, -1);
      }
      cleanEncoded = cleanEncoded.replace(/\\"/g, '"');
      const binaryString = window.atob(cleanEncoded);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes);
    } catch (error) {
      console.error("Error decoding base64 string:", error, "Input:", encoded);
      return null;
    }
  }, []);

  const backgroundImageFront = idCardData?.frontImage?.url || "";
  const decodedApiFrontTemplate = useMemo(() => {
    if (!idCardData?.frontTemplate) return null;
    let html = decodeBase64(idCardData.frontTemplate);
    if (!html) return null;

    html = html
      .replace(/\$\{name\}/g, student.studentName || "")
      .replace(/\$\{class\}/g, student.class || "")
      .replace(/\$\{father_name\}/g, student.fatherName || "")
      .replace(/\$\{mobile\}/g, student.contact || "")
      .replace(/\$\{admissionNumber\}/g, student.admissionNumber || "")
      .replace(/\$\{transport\}/g, student.transport || "")
      .replace(/\$\{address\}/g, student.address || "")
      .replace(/\$\{dob\}/g,moment( student.dateOfBirth).format("DD-MM-YYYY") || "")
      .replace(/\$\{mother_name\}/g,student.motherName || "")
      .replace(/\$\{studentImage\}/g, student.studentImage?.url || "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgcIBwgHBwcHBwoICAcHBw8ICQYKFREWFhURExMYHSggGBolGxMTITEhJSkrLi4uFx8zODMsNygtLisBCgoKDQ0NFQ8QDi0ZFRkrKysrKzc3Ky0rKysrLisrKzcrKysrKystKy0tKystKysrKysrKystKysrKysrKysrK//AABEIASsAqAMBEQACEQEDEQH/xAAYAAEBAQEBAAAAAAAAAAAAAAAAAQIDB//EABsQAQEAAwEBAQAAAAAAAAAAAAABAhEhQQMx/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAGREBAQEAAwAAAAAAAAAAAAAAAAERAiFB/9oADAMBAAIRAxEAPwD3EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEtRFVQAAAAAAAAAAAAAAAAAAE9QVQAAAAAAAAAAAAAAAAAABlkaaAAAAAAAAAAAAAAAAAEiQVQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEFUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARBVAAAAAAAAAAAAAAAAAACoCgACeoKoAAAAAAAAAAAAAAAAAAAICgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARBVAAAAAAAAAAAAAAAAAAAEiQVQAAAAABEQ2KqgAAAAAAAACUFAAAAAABKiJbqUDDqpGhoAAAAAAAAAAAAAAAAAQYzm5pYzWsZqHqxRQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEt0gxfpN6Ws7talRpdgqgAAAAAAAAAAAAAAADGe7OEZrnj8+9OVOMzt1s4y0zjLvoOjQAAAAAAAAAAAAAAAAmkwxVAEiQVQAAAAAAAAAAQFAAAAAAEqUSfqDTQAAAAAAAAAAAAAAAAAAlShAVQAAAAB//2Q==")
      .replace(/\$\{backgroundImage\}/g, student.backgroundImage || backgroundImageFront || "");

    return html;
  }, [idCardData, decodeBase64, student, backgroundImageFront]);
  if (decodedApiFrontTemplate) {
    return (
      <div

        dangerouslySetInnerHTML={{ __html: decodedApiFrontTemplate }}
      />
    );
  }


};

export default FrontTemplate;

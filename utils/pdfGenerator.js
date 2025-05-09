// PDF generation utility for screenshot exports
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generate a PDF file with screenshot results
 * @param {Object} data - The screenshot data to include in the PDF
 * @param {string} title - The title of the PDF document
 * @returns {jsPDF} - The generated PDF document object
 */
export const generatePDF = async (data, title = "Screenshot Report") => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set document properties
  doc.setProperties({
    title: title,
    subject: "Screenshot Report",
    author: "Screenshot Tool",
    creator: "Screenshot Tool",
  });

  // Add title
  doc.setFontSize(20);
  doc.text(title, 15, 15);

  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 22);

  // Current Y position for content
  let yPos = 30;

  // Process each category
  Object.entries(data).forEach(([categoryName, screenshots], categoryIndex) => {
    // Add page break if needed (except for first category)
    if (categoryIndex > 0 && yPos > 240) {
      doc.addPage();
      yPos = 15;
    }

    // Add category header
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(categoryName, 15, yPos);
    yPos += 8;

    // Add URL if available
    if (data.categoryUrls && data.categoryUrls[categoryName]) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`URL: ${data.categoryUrls[categoryName]}`, 15, yPos);
      yPos += 6;
    }

    // Process each screenshot in this category
    Object.entries(screenshots).forEach(([adName, screenshot], index) => {
      // Check if we need a new page
      if (yPos > 240) {
        doc.addPage();
        yPos = 15;
      }

      // Add screenshot info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(adName, 15, yPos);
      yPos += 6;

      if (screenshot.error) {
        // Handle error case
        doc.setTextColor(200, 0, 0);
        doc.setFontSize(10);
        doc.text(`Error: ${screenshot.error}`, 15, yPos);
        yPos += 8;
      } else {
        // Add screenshot image
        try {
          // Only add if it's a browser environment
          if (typeof window !== "undefined") {
            doc.addImage(
              screenshot.path,
              "PNG",
              15,
              yPos,
              Math.min(180, screenshot.width / 4),
              Math.min(100, screenshot.height / 4)
            );

            // Update yPos based on image height
            yPos += Math.min(100, screenshot.height / 4) + 5;
          }
        } catch (e) {
          console.error("Failed to add image to PDF:", e);
          doc.text("Image could not be loaded", 15, yPos);
          yPos += 8;
        }

        // Add dimensions
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Dimensions: ${Math.round(screenshot.width)}px × ${Math.round(
            screenshot.height
          )}px`,
          15,
          yPos
        );
        yPos += 6;

        // Add image information
        if (screenshot.images && screenshot.images.length > 0) {
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text("Images found:", 15, yPos);
          yPos += 6;

          // Create table for images
          const tableData = screenshot.images.map((img, idx) => {
            const isStretched =
              img.renderedWidth > img.naturalWidth ||
              img.renderedHeight > img.naturalHeight;

            return [
              `Image #${idx + 1}`,
              `${img.renderedWidth}px × ${img.renderedHeight}px`,
              `${img.naturalWidth}px × ${img.naturalHeight}px`,
              `${
                typeof img.aspectRatio === "number"
                  ? img.aspectRatio.toFixed(2)
                  : "Unknown"
              }`,
              isStretched
                ? `⚠️ Stretched (W: ${
                    typeof img.widthScaling === "string"
                      ? img.widthScaling
                      : "Unknown"
                  }, H: ${
                    typeof img.heightScaling === "string"
                      ? img.heightScaling
                      : "Unknown"
                  })`
                : "OK",
            ];
          });

          autoTable(doc, {
            startY: yPos,
            head: [
              [
                "Image",
                "Rendered Size",
                "Natural Size",
                "Aspect Ratio",
                "Status",
              ],
            ],
            body: tableData,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 1 },
            headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
            columnStyles: {
              4: {
                fillColor: (data, row) => {
                  return data === "OK" ? [255, 255, 255] : [255, 240, 230];
                },
                textColor: (data, row) => {
                  return data === "OK" ? [0, 150, 0] : [200, 80, 0];
                },
              },
            },
            margin: { left: 15, right: 15 },
          });

          // Update Y position after table
          yPos = doc.lastAutoTable.finalY + 10;
        }
      }

      // Add separator
      doc.setDrawColor(200, 200, 200);
      doc.line(15, yPos - 5, 195, yPos - 5);
      yPos += 10;
    });
  });

  return doc;
};

/**
 * Save the PDF to file
 * @param {jsPDF} doc - The PDF document
 * @param {string} filename - The filename to save as
 */
export const savePDF = (doc, filename = "screenshot-report.pdf") => {
  doc.save(filename);
};

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

  // Define colors for a more modern look
  const colors = {
    primary: [41, 98, 255], // #2962FF - for main headings
    secondary: [45, 55, 72], // #2D3748 - for subheadings (slate-800)
    text: [74, 85, 104], // #4A5568 - for regular text (slate-600)
    success: [56, 161, 105], // #38A169 - for success indicators
    warning: [221, 107, 32], // #DD6B20 - for warnings
    lightGray: [237, 242, 247], // #EDF2F7 - for backgrounds (slate-100)
  };

  // Add a header with background
  doc.setFillColor(...colors.lightGray);
  doc.rect(0, 0, 210, 30, "F");

  // Add title
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.setFontSize(24);
  doc.text(title, 15, 15);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 22);

  // Current Y position for content
  let yPos = 30;

  // Process each category
  Object.entries(data).forEach(([categoryName, screenshots], categoryIndex) => {
    // Add page break if needed (except for first category)
    if (categoryIndex > 0 && yPos > 240) {
      doc.addPage();

      // Add subtle header to new page
      doc.setFillColor(...colors.lightGray);
      doc.rect(0, 0, 210, 15, "F");
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.secondary);
      doc.setFontSize(10);
      doc.text(`${title} (continued)`, 15, 10);

      yPos = 25;
    }

    // Add category header with background
    doc.setFillColor(...colors.lightGray);
    doc.roundedRect(10, yPos - 5, 190, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.secondary);
    doc.setFontSize(14);
    doc.text(categoryName, 15, yPos);
    yPos += 10;

    // Add URL if available
    if (data.categoryUrls && data.categoryUrls[categoryName]) {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...colors.text);
      doc.setFontSize(9);
      doc.text(`URL: ${data.categoryUrls[categoryName]}`, 15, yPos);
      yPos += 8;
    }

    // Process each screenshot in this category
    Object.entries(screenshots).forEach(([adName, screenshot], index) => {
      // Check if we need a new page
      if (yPos > 240) {
        doc.addPage();

        // Add subtle header to new page
        doc.setFillColor(...colors.lightGray);
        doc.rect(0, 0, 210, 15, "F");
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.secondary);
        doc.setFontSize(10);
        doc.text(`${title} (continued)`, 15, 10);

        yPos = 25;
      }

      // Add screenshot info with card-like appearance
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(230, 230, 230);
      doc.roundedRect(10, yPos - 5, 190, 8, 1, 1, "FD");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.secondary);
      doc.setFontSize(12);
      doc.text(adName, 15, yPos);
      yPos += 6;

      if (screenshot.error) {
        // Handle error case with a nice error box
        doc.setFillColor(254, 226, 226); // Light red background
        doc.setDrawColor(252, 129, 129); // Red border
        doc.roundedRect(15, yPos, 180, 10, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setTextColor(197, 48, 48); // Red text
        doc.setFontSize(10);
        doc.text(`Error: ${screenshot.error}`, 20, yPos + 6);
        yPos += 15;
      } else {
        // Add screenshot image
        try {
          // Only add if it's a browser environment
          if (typeof window !== "undefined") {
            // Add a subtle background for the image
            const imgWidth = Math.min(180, screenshot.width / 4);
            const imgHeight = Math.min(100, screenshot.height / 4);

            doc.setFillColor(250, 250, 250);
            doc.setDrawColor(230, 230, 230);
            doc.roundedRect(
              14,
              yPos - 1,
              imgWidth + 2,
              imgHeight + 2,
              2,
              2,
              "FD"
            );

            doc.addImage(screenshot.path, "PNG", 15, yPos, imgWidth, imgHeight);

            // Update yPos based on image height
            yPos += imgHeight + 8;
          }
        } catch (e) {
          console.error("Failed to add image to PDF:", e);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(...colors.warning);
          doc.text("Image could not be loaded", 15, yPos);
          yPos += 8;
        }

        // Add dimensions with badge-like appearance
        doc.setFillColor(245, 250, 255); // Light blue background
        doc.setDrawColor(235, 240, 245); // Blue border
        doc.roundedRect(15, yPos - 5, 85, 8, 2, 2, "FD");

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.text);
        doc.setFontSize(9);
        doc.text(
          `Dimensions: ${Math.round(screenshot.width)}px × ${Math.round(
            screenshot.height
          )}px`,
          18,
          yPos
        );
        yPos += 6;

        // Add image information
        if (screenshot.images && screenshot.images.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.secondary);
          doc.setFontSize(10);
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
            styles: {
              fontSize: 8,
              cellPadding: 2,
              font: "helvetica",
              lineColor: [230, 230, 230],
              lineWidth: 0.1,
            },
            headStyles: {
              fillColor: [...colors.lightGray],
              textColor: [...colors.secondary],
              fontStyle: "bold",
              halign: "center",
            },
            columnStyles: {
              0: { fontStyle: "bold" },
              4: {
                fillColor: (data, row) => {
                  return data === "OK" ? [240, 255, 244] : [255, 245, 230];
                },
                textColor: (data, row) => {
                  return data === "OK"
                    ? [...colors.success]
                    : [...colors.warning];
                },
                fontStyle: "bold",
                halign: "center",
              },
            },
            margin: { left: 15, right: 15 },
            alternateRowStyles: {
              fillColor: [250, 250, 250],
            },
          });

          // Update Y position after table
          yPos = doc.lastAutoTable.finalY + 10;
        }
      }

      // Add a more visually appealing separator
      doc.setFillColor(248, 250, 252);
      doc.rect(15, yPos - 2, 180, 0.5, "F");
      yPos += 12;
    });
  });

  // Add footer to each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Add footer with line
    doc.setDrawColor(230, 230, 230);
    doc.line(15, 285, 195, 285);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...colors.text);
    doc.text("Generated by GoShotBroad Screenshot Tool", 15, 290);

    // Add page numbers
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${i} of ${pageCount}`, 195, 290, null, null, "right");
  }

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

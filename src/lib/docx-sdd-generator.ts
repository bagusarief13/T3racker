import fs from "fs";
import path from "path";
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  VerticalAlign,
  BorderStyle,
  HeightRule,
  Packer,
  ImageRun,
} from "docx";
import { getVendorById } from "./vendors";

export interface SddOvertimeData {
  profile: {
    nama: string;
    npp: string;
    departemen: string;
    pemohonName: string;
    diperiksaName: string;
    disetujuiName: string;
    vendor?: string;
  };
  overtimeDays: Array<{
    dateFormatted: string; // e.g. "Rabu 2 September 2026"
    dateShort: string; // e.g. "2 September 2026"
    jamMasuk: string;
    jamPulang: string;
    kegiatan: string;
  }>;
}

export async function generateSddDocx(data: SddOvertimeData): Promise<Buffer> {
  const vendor = getVendorById(data.profile.vendor);

  // Format dates and hours with semicolon delimiter and trailing semicolon matching official format
  const datesListStr =
    data.overtimeDays.length > 0
      ? data.overtimeDays.map((d) => d.dateFormatted).join("; ") + ";"
      : "-";

  const hoursListStr =
    data.overtimeDays.length > 0
      ? data.overtimeDays.map((d) => `${d.jamMasuk} s/d ${d.jamPulang}`).join("; ") + ";"
      : "-";

  const taskParagraphs =
    data.overtimeDays.length > 0
      ? data.overtimeDays.map((d) => {
          let taskText = (d.kegiatan || "Penyelesaian tugas dan perbaikan sistem").trim();
          // Prevent double date prefix if user already typed the date in their notes
          if (taskText.startsWith(`${d.dateShort} -`)) {
            taskText = taskText.substring(`${d.dateShort} -`.length).trim();
          } else if (taskText.startsWith(`${d.dateShort} :`)) {
            taskText = taskText.substring(`${d.dateShort} :`.length).trim();
          }

          return new Paragraph({
            spacing: { before: 25, after: 25 },
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: `${d.dateShort} - ${taskText}`,
                font: "Arial",
                size: 20, // 10pt Arial
              }),
            ],
          });
        })
      : [
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: "- Tidak ada data lembur pada periode ini -",
                font: "Arial",
                size: 20,
                italics: true,
              }),
            ],
          }),
        ];

  // Attempt to load official vendor wide logo
  let logoRun: ImageRun | null = null;
  try {
    let logoPath = path.join(process.cwd(), "public", "vendors", `${vendor.id}-wide.png`);
    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(process.cwd(), "public", "vendors", `${vendor.id}.png`);
    }
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoRun = new ImageRun({
        type: "png",
        data: logoBuffer,
        transformation: {
          width: 136,
          height: 51,
        },
      });
    }
  } catch (err) {
    console.warn("Could not load vendor logo for SPKL Word export:", err);
  }



  const singleBorder = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
  const noBorder = { style: BorderStyle.NONE };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 20, // 10pt
          },
          paragraph: {
            spacing: { line: 240 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 1000,
              right: 1000,
            },
          },
        },
        children: [
          // Top form code outside the box
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: vendor.spklFormCode || "SDD-FM-HRD-04-01 Rev. 1",
                font: "Arial",
                size: 20, // 10pt
              }),
            ],
          }),

          // Main Form Table with continuous outer border
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: singleBorder,
              bottom: singleBorder,
              left: singleBorder,
              right: singleBorder,
              insideHorizontal: singleBorder,
              insideVertical: singleBorder,
            },
            rows: [
              // Row 1: Header (Logo on left, Centered Title on right, columnSpan: 3)
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 3,
                    borders: {
                      top: singleBorder,
                      bottom: singleBorder,
                      left: singleBorder,
                      right: singleBorder,
                    },
                    margins: { top: 80, bottom: 80, left: 100, right: 100 },
                    children: [
                      new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                          top: noBorder,
                          bottom: noBorder,
                          left: noBorder,
                          right: noBorder,
                          insideHorizontal: noBorder,
                          insideVertical: noBorder,
                        },
                        rows: [
                          new TableRow({
                            children: [
                              new TableCell({
                                width: { size: 26, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                verticalAlign: VerticalAlign.CENTER,
                                children: logoRun
                                  ? [new Paragraph({ children: [logoRun] })]
                                  : [
                                      new Paragraph({
                                        children: [
                                          new TextRun({
                                            text: vendor.shortName,
                                            font: "Arial",
                                            size: 20,
                                            bold: true,
                                          }),
                                        ],
                                      }),
                                    ],
                              }),
                              new TableCell({
                                width: { size: 48, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                verticalAlign: VerticalAlign.CENTER,
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                      new TextRun({
                                        text: "SURAT PERINTAH KERJA LEMBUR",
                                        bold: true,
                                        font: "Arial",
                                        size: 20,
                                      }),
                                    ],
                                  }),
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 30 },
                                    children: [
                                      new TextRun({
                                        text: vendor.spklCompanyHeader,
                                        bold: true,
                                        font: "Arial",
                                        size: 20,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              new TableCell({
                                width: { size: 26, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                children: [new Paragraph({})],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Row 2: Metadata & Uraian Tugas Bullets (columnSpan: 3)
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 3,
                    borders: {
                      top: singleBorder,
                      bottom: singleBorder,
                      left: singleBorder,
                      right: singleBorder,
                    },
                    margins: { top: 90, bottom: 90, left: 120, right: 120 },
                    children: [
                      // Metadata 2-col borderless table
                      new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                          top: noBorder,
                          bottom: noBorder,
                          left: noBorder,
                          right: noBorder,
                          insideHorizontal: noBorder,
                          insideVertical: noBorder,
                        },
                        rows: [
                          new TableRow({
                            children: [
                              new TableCell({
                                width: { size: 18, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                children: [new Paragraph({ children: [new TextRun({ text: "Hari / Tanggal", font: "Arial", size: 20 })] })],
                              }),
                              new TableCell({
                                width: { size: 82, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                children: [new Paragraph({ children: [new TextRun({ text: `: ${datesListStr}`, font: "Arial", size: 20 })] })],
                              }),
                            ],
                          }),
                          new TableRow({
                            children: [
                              new TableCell({
                                width: { size: 18, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                children: [new Paragraph({ spacing: { before: 50 }, children: [new TextRun({ text: "Jam Lembur", font: "Arial", size: 20 })] })],
                              }),
                              new TableCell({
                                width: { size: 82, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                children: [new Paragraph({ spacing: { before: 50 }, children: [new TextRun({ text: `: ${hoursListStr}`, font: "Arial", size: 20 })] })],
                              }),
                            ],
                          }),
                          new TableRow({
                            children: [
                              new TableCell({
                                width: { size: 18, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                children: [new Paragraph({ spacing: { before: 50 }, children: [new TextRun({ text: "Nama Karyawan", font: "Arial", size: 20 })] })],
                              }),
                              new TableCell({
                                width: { size: 82, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                children: [new Paragraph({ spacing: { before: 50 }, children: [new TextRun({ text: `: ${data.profile.nama}`, font: "Arial", size: 20 })] })],
                              }),
                            ],
                          }),
                          new TableRow({
                            children: [
                              new TableCell({
                                width: { size: 18, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                children: [new Paragraph({ spacing: { before: 50 }, children: [new TextRun({ text: "Department", font: "Arial", size: 20 })] })],
                              }),
                              new TableCell({
                                width: { size: 82, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                children: [new Paragraph({ spacing: { before: 50 }, children: [new TextRun({ text: `: ${data.profile.departemen}`, font: "Arial", size: 20 })] })],
                              }),
                            ],
                          }),
                          new TableRow({
                            children: [
                              new TableCell({
                                width: { size: 18, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                children: [new Paragraph({ spacing: { before: 50 }, children: [new TextRun({ text: "Uraian Tugas", font: "Arial", size: 20 })] })],
                              }),
                              new TableCell({
                                width: { size: 82, type: WidthType.PERCENTAGE },
                                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                                children: [new Paragraph({ spacing: { before: 50 }, children: [new TextRun({ text: ":", font: "Arial", size: 20 })] })],
                              }),
                            ],
                          }),
                        ],
                      }),

                      new Paragraph({ spacing: { before: 60 } }),

                      // Bullets
                      ...taskParagraphs,

                      new Paragraph({ spacing: { before: 60 } }),
                    ],
                  }),
                ],
              }),

              // Row 3: Signature Titles (3 columns)
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 33.3, type: WidthType.PERCENTAGE },
                    borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
                    margins: { top: 60, bottom: 60, left: 60, right: 60 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "KARYAWAN YBS", bold: true, font: "Arial", size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 33.3, type: WidthType.PERCENTAGE },
                    borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
                    margins: { top: 60, bottom: 60, left: 60, right: 60 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "TEAM LEADER", bold: true, font: "Arial", size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 33.4, type: WidthType.PERCENTAGE },
                    borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
                    margins: { top: 60, bottom: 60, left: 60, right: 60 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "DEPT HEAD", bold: true, font: "Arial", size: 20 })],
                      }),
                    ],
                  }),
                ],
              }),

              // Row 4: Signature Space & Names (3 columns)
              new TableRow({
                height: { value: 1200, rule: HeightRule.ATLEAST },
                children: [
                  new TableCell({
                    width: { size: 33.3, type: WidthType.PERCENTAGE },
                    borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
                    verticalAlign: VerticalAlign.BOTTOM,
                    margins: { top: 60, bottom: 80, left: 60, right: 60 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 800 },
                        children: [new TextRun({ text: data.profile.pemohonName || data.profile.nama, font: "Arial", size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 33.3, type: WidthType.PERCENTAGE },
                    borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
                    verticalAlign: VerticalAlign.BOTTOM,
                    margins: { top: 60, bottom: 80, left: 60, right: 60 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 800 },
                        children: [new TextRun({ text: data.profile.diperiksaName, font: "Arial", size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 33.4, type: WidthType.PERCENTAGE },
                    borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
                    verticalAlign: VerticalAlign.BOTTOM,
                    margins: { top: 60, bottom: 80, left: 60, right: 60 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 800 },
                        children: [new TextRun({ text: data.profile.disetujuiName, font: "Arial", size: 20 })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

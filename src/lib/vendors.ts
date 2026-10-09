/**
 * Vendor Configurations for BNI IT Partner Ecosystem
 * Supports timesheet forms, SPKL letters, and document exports.
 */

export interface VendorConfig {
  id: string;
  name: string;
  shortName: string;
  legalName: string;
  spklCompanyHeader: string;
  spklFormCode: string;
  tagline: string;
  logo: string; // 512x512 square transparent PNG
  logoWide: string; // 800x300 wide transparent PNG
  logoRetina: string; // 1024x1024 retina transparent PNG
  primaryColor: string;
  primaryColorHex: string;
  accentColor: string;
  defaultProject?: string;
  defaultDivision?: string;
  description: string;
}

export const BNI_VENDORS: VendorConfig[] = [
  {
    id: "sdd",
    name: "SDD (Make IT real)",
    shortName: "SDD",
    legalName: "PT. SWADHARMA DUTA DATA",
    spklCompanyHeader: "PT. SWADHARMA DUTA DATA",
    spklFormCode: "SDD-FM-HRD-04-01 Rev. 1",
    tagline: "Make IT real",
    logo: "/vendors/sdd.png",
    logoWide: "/vendors/sdd-wide.png",
    logoRetina: "/vendors/sdd-1024.png",
    primaryColor: "#0A3B72",
    primaryColorHex: "00529B",
    accentColor: "#F58220",
    defaultProject: "Collection",
    defaultDivision: "RDL",
    description: "PT Swadharma Duta Data",
  },
  {
    id: "iglo",
    name: "Iglo",
    shortName: "Iglo",
    legalName: "PT Indocyber Global Teknologi",
    spklCompanyHeader: "PT. INDOCYBER GLOBAL TEKNOLOGI",
    spklFormCode: "IGLO-FM-HRD-04-01 Rev. 1",
    tagline: "The Digital Enabler",
    logo: "/vendors/iglo.png",
    logoWide: "/vendors/iglo-wide.png",
    logoRetina: "/vendors/iglo-1024.png",
    primaryColor: "#D8232A",
    primaryColorHex: "D8232A",
    accentColor: "#F2545B",
    defaultProject: "Collection",
    defaultDivision: "RDL",
    description: "PT Indocyber Global Teknologi (Iglo)",
  },
  {
    id: "ntt-data",
    name: "NTT DATA",
    shortName: "NTT DATA",
    legalName: "PT NTT DATA Indonesia",
    spklCompanyHeader: "PT. NTT DATA INDONESIA",
    spklFormCode: "NTTD-FM-HRD-04-01 Rev. 1",
    tagline: "Trusted Global Innovator",
    logo: "/vendors/ntt-data.png",
    logoWide: "/vendors/ntt-data-wide.png",
    logoRetina: "/vendors/ntt-data-1024.png",
    primaryColor: "#0066B3",
    primaryColorHex: "0066B3",
    accentColor: "#4DA1E8",
    defaultProject: "Collection",
    defaultDivision: "RDL",
    description: "PT NTT DATA Indonesia (NTT DATA Corporation)",
  },
  {
    id: "adidata",
    name: "ADIDATA",
    shortName: "ADIDATA",
    legalName: "PT Adidata Informatika",
    spklCompanyHeader: "PT. ADIDATA INFORMATIKA",
    spklFormCode: "ADIDATA-FM-HRD-04-01 Rev. 1",
    tagline: "Delivers IT Solution",
    logo: "/vendors/adidata.png",
    logoWide: "/vendors/adidata-wide.png",
    logoRetina: "/vendors/adidata-1024.png",
    primaryColor: "#EC1C24",
    primaryColorHex: "EC1C24",
    accentColor: "#707070",
    defaultProject: "Collection",
    defaultDivision: "RDL",
    description: "PT Adidata Informatika (Delivers IT Solution)",
  },
  {
    id: "mii",
    name: "Mitra Integrasi Informatika (MII)",
    shortName: "MII",
    legalName: "PT Mitra Integrasi Informatika",
    spklCompanyHeader: "PT. MITRA INTEGRASI INFORMATIKA",
    spklFormCode: "MII-FM-HRD-04-01 Rev. 1",
    tagline: "Metrodata Group",
    logo: "/vendors/mii.png",
    logoWide: "/vendors/mii-wide.png",
    logoRetina: "/vendors/mii-1024.png",
    primaryColor: "#0078B4",
    primaryColorHex: "0078B4",
    accentColor: "#68B030",
    defaultProject: "Collection",
    defaultDivision: "RDL",
    description: "PT Mitra Integrasi Informatika (Metrodata Group)",
  },
];

/**
 * Get vendor config by ID with fallback to default (SDD)
 */
export function getVendorById(vendorId?: string): VendorConfig {
  const found = BNI_VENDORS.find((v) => v.id.toLowerCase() === (vendorId || "").toLowerCase());
  return found || BNI_VENDORS[0]; // defaults to SDD
}

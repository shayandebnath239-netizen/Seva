import { db, createPool } from './index.ts';
import { categories, states, districts, services, officialLinks, documents, serviceDocuments, eligibilityRules, checklistItems, checklists, verificationRecords, bookmarks } from './schema.ts';

async function seed() {
  console.log("Clearing existing data...");
  try {
    // Delete in reverse dependency order
    await db.delete(checklistItems);
    await db.delete(checklists);
    await db.delete(serviceDocuments);
    await db.delete(eligibilityRules);
    await db.delete(officialLinks);
    await db.delete(verificationRecords);
    await db.delete(bookmarks);
    await db.delete(services);
    await db.delete(documents);
    await db.delete(districts);
    await db.delete(states);
    await db.delete(categories);

    console.log("Seeding comprehensive database...");

    // Categories
    const cats = await db.insert(categories).values([
      { name: 'Agriculture', slug: 'agriculture', icon: 'tractor' },
      { name: 'Education', slug: 'education', icon: 'graduation-cap' },
      { name: 'Healthcare', slug: 'healthcare', icon: 'heart-pulse' },
      { name: 'Housing', slug: 'housing', icon: 'building' },
      { name: 'Business & Finance', slug: 'business', icon: 'briefcase' },
      { name: 'Social Welfare', slug: 'welfare', icon: 'users' },
    ]).returning();
    
    const catMap = cats.reduce((acc, cat) => ({ ...acc, [cat.name]: cat.id }), {} as Record<string, number>);

    // States
    const st = await db.insert(states).values([
      { name: 'Central Government', code: 'CENTRAL', type: 'CENTRAL' },
      { name: 'Maharashtra', code: 'MH', type: 'STATE' },
      { name: 'Karnataka', code: 'KA', type: 'STATE' },
      { name: 'Delhi', code: 'DL', type: 'UT' },
    ]).returning();
    const centralStateId = st.find(s => s.code === 'CENTRAL')!.id;

    // Documents
    const docs = await db.insert(documents).values([
      { name: 'Aadhaar Card', description: 'Unique identification number issued by UIDAI' },
      { name: 'PAN Card', description: 'Permanent Account Number for tax' },
      { name: 'Bank Passbook', description: 'For Direct Benefit Transfer (DBT)' },
      { name: 'Income Certificate', description: 'Proof of annual family income' },
      { name: 'Caste Certificate', description: 'Proof of social category if applicable' },
      { name: 'Ration Card', description: 'Proof of household and PDS' },
      { name: 'Land Records (7/12)', description: 'Proof of land ownership' },
    ]).returning();
    const docMap = docs.reduce((acc, d) => ({ ...acc, [d.name]: d.id }), {} as Record<string, number>);

    // --- Schemes ---
    
    // 1. PM-KISAN
    const [svcPMKisan] = await db.insert(services).values({
      name: 'PM Kisan Samman Nidhi',
      description: 'Financial benefit of ₹6000 per annum per family payable in three equal installments to all landholding farmers.',
      categoryId: catMap['Agriculture'],
      jurisdiction: 'CENTRAL',
      verificationStatus: 'VERIFIED',
      lastVerifiedAt: new Date()
    }).returning();

    await db.insert(eligibilityRules).values({
      serviceId: svcPMKisan.id,
      specialConditions: 'Must own cultivable land. Excludes institutional landholders and taxpayers.',
    });

    await db.insert(serviceDocuments).values([
      { serviceId: svcPMKisan.id, documentId: docMap['Aadhaar Card'], isRequired: true, notes: 'Must be linked to bank' },
      { serviceId: svcPMKisan.id, documentId: docMap['Bank Passbook'], isRequired: true },
      { serviceId: svcPMKisan.id, documentId: docMap['Land Records (7/12)'], isRequired: true },
    ]);

    // 2. Ayushman Bharat
    const [svcAyushman] = await db.insert(services).values({
      name: 'Ayushman Bharat (PM-JAY)',
      description: 'World\'s largest health insurance/assurance scheme fully financed by the government. Provides a cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization.',
      categoryId: catMap['Healthcare'],
      jurisdiction: 'CENTRAL',
      verificationStatus: 'VERIFIED',
      lastVerifiedAt: new Date()
    }).returning();

    await db.insert(eligibilityRules).values({
      serviceId: svcAyushman.id,
      specialConditions: 'Based on deprivation and occupational criteria of Socio-Economic Caste Census (SECC) 2011.',
    });

    await db.insert(serviceDocuments).values([
      { serviceId: svcAyushman.id, documentId: docMap['Aadhaar Card'], isRequired: true },
      { serviceId: svcAyushman.id, documentId: docMap['Ration Card'], isRequired: true },
    ]);

    // 3. PM Awas Yojana
    const [svcPMAY] = await db.insert(services).values({
      name: 'Pradhan Mantri Awas Yojana (PMAY)',
      description: 'Provides affordable housing to the urban and rural poor with a target of building 20 million affordable houses.',
      categoryId: catMap['Housing'],
      jurisdiction: 'CENTRAL',
      verificationStatus: 'VERIFIED',
      lastVerifiedAt: new Date()
    }).returning();

    await db.insert(eligibilityRules).values({
      serviceId: svcPMAY.id,
      incomeLimit: 1800000,
      specialConditions: 'Beneficiary family should not own a pucca house anywhere in India.',
    });

    // 4. PM MUDRA Yojana
    const [svcMudra] = await db.insert(services).values({
      name: 'Pradhan Mantri MUDRA Yojana',
      description: 'Loans up to Rs. 10 Lakhs to non-corporate, non-farm small/micro enterprises. Categories: Shishu, Kishore, Tarun.',
      categoryId: catMap['Business & Finance'],
      jurisdiction: 'CENTRAL',
      verificationStatus: 'VERIFIED',
      lastVerifiedAt: new Date()
    }).returning();

    await db.insert(serviceDocuments).values([
      { serviceId: svcMudra.id, documentId: docMap['Aadhaar Card'], isRequired: true },
      { serviceId: svcMudra.id, documentId: docMap['PAN Card'], isRequired: true },
      { serviceId: svcMudra.id, documentId: docMap['Bank Passbook'], isRequired: true },
    ]);

    // 5. Sukanya Samriddhi
    const [svcSukanya] = await db.insert(services).values({
      name: 'Sukanya Samriddhi Yojana',
      description: 'A small deposit scheme for the girl child launched as part of the Beti Bachao Beti Padhao campaign. Offers high interest rates and tax benefits.',
      categoryId: catMap['Social Welfare'],
      jurisdiction: 'CENTRAL',
      verificationStatus: 'VERIFIED',
      lastVerifiedAt: new Date()
    }).returning();

    await db.insert(eligibilityRules).values({
      serviceId: svcSukanya.id,
      gender: 'Female',
      ageMax: 10,
      specialConditions: 'Account must be opened before the girl child turns 10 years old.',
    });

    // 6. Stand Up India
    const [svcStandUp] = await db.insert(services).values({
      name: 'Stand Up India Scheme',
      description: 'Facilitates bank loans between 10 lakh and 1 Crore to at least one SC/ST borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise.',
      categoryId: catMap['Business & Finance'],
      jurisdiction: 'CENTRAL',
      verificationStatus: 'VERIFIED',
      lastVerifiedAt: new Date()
    }).returning();

    await db.insert(eligibilityRules).values({
      serviceId: svcStandUp.id,
      ageMin: 18,
      specialConditions: 'SC/ST and/or woman entrepreneur. Enterprise must be greenfield (first time venture).',
    });

    // Official Links
    await db.insert(officialLinks).values([
      { serviceId: svcPMKisan.id, sourceUrl: 'https://pmkisan.gov.in/', applicationUrl: 'https://pmkisan.gov.in/RegistrationFormNew.aspx', sourceName: 'Department of Agriculture', sourceType: 'Central Portal' },
      { serviceId: svcAyushman.id, sourceUrl: 'https://pmjay.gov.in/', applicationUrl: 'https://beneficiary.nha.gov.in/', sourceName: 'National Health Authority', sourceType: 'Central Portal' },
      { serviceId: svcPMAY.id, sourceUrl: 'https://pmaymis.gov.in/', sourceName: 'Ministry of Housing', sourceType: 'Central Portal' },
      { serviceId: svcMudra.id, sourceUrl: 'https://www.mudra.org.in/', sourceName: 'MUDRA', sourceType: 'Central Portal' },
      { serviceId: svcSukanya.id, sourceUrl: 'https://www.indiapost.gov.in/Financial/Pages/Content/Sukanya-Samriddhi-Account.aspx', sourceName: 'India Post', sourceType: 'Central Portal' },
    ]);

    console.log("Seeding complete! Added comprehensive schemes.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

seed();

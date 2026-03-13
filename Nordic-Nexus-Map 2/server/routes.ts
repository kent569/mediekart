import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === API ROUTES ===

  app.get(api.map.data.path, async (_req, res) => {
    const [countries, companies, offices, relationships] = await Promise.all([
      storage.getCountries(),
      storage.getCompanies(),
      storage.getOffices(),
      storage.getRelationships(),
    ]);

    res.json({
      countries,
      companies,
      offices,
      relationships,
    });
  });

  app.get(api.companies.list.path, async (req, res) => {
    // Basic list, filters could be applied here if we implemented full filtering logic in storage
    const companies = await storage.getCompanies();
    res.json(companies);
  });

  app.get(api.companies.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const company = await storage.getCompanyWithDetails(id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    res.json(company);
  });

  // === SEED DATA ===
  // In a real app, this would be a separate script or protected endpoint
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingCountries = await storage.getCountries();
  if (existingCountries.length > 0) return;

  console.log("Seeding database...");

  // 1. Countries
  const no = await storage.createCountry({ name: "Norway", code: "NO", lat: 60.47, lng: 8.46 });
  const se = await storage.createCountry({ name: "Sweden", code: "SE", lat: 60.12, lng: 18.64 });
  const dk = await storage.createCountry({ name: "Denmark", code: "DK", lat: 56.26, lng: 9.50 });
  const fi = await storage.createCountry({ name: "Finland", code: "FI", lat: 61.92, lng: 25.74 });

  // 2. JP/Politikens Hus Hierarchy
  const jpPolitiken = await storage.createCompany({
    name: "JP/Politikens Hus",
    industry: "Media",
    description: "Major Danish media group.",
    website: "https://jppol.dk"
  });

  await storage.createOffice({
    companyId: jpPolitiken.id,
    countryId: dk.id,
    city: "Copenhagen",
    lat: 55.6761,
    lng: 12.5683,
    type: "HQ"
  });

  const watchMedierDK = await storage.createCompany({
    name: "Watch Medier AS",
    industry: "Media",
    description: "Business news provider, part of JP/Politikens Hus.",
    website: "https://watchmedier.dk"
  });

  await storage.createOffice({
    companyId: watchMedierDK.id,
    countryId: dk.id,
    city: "Copenhagen",
    lat: 55.6761,
    lng: 12.5683,
    type: "HQ"
  });

  await storage.createRelationship({
    sourceCompanyId: jpPolitiken.id,
    targetCompanyId: watchMedierDK.id,
    type: "Ownership",
    percentage: 100,
    description: "Wholly owned subsidiary."
  });

  const watchMediaNO = await storage.createCompany({
    name: "Watch Media Norway",
    industry: "Media",
    description: "Norwegian branch of Watch Medier.",
    website: "https://watchmedia.no"
  });

  // Watch Media Norway HQ (Stortorvet 10, Oslo)
  await storage.createOffice({
    companyId: watchMediaNO.id,
    countryId: no.id,
    city: "Oslo",
    lat: 59.9127,
    lng: 10.7445,
    type: "HQ"
  });

  await storage.createRelationship({
    sourceCompanyId: watchMedierDK.id,
    targetCompanyId: watchMediaNO.id,
    type: "Ownership",
    percentage: 100,
    description: "Wholly owned subsidiary."
  });

  const watchPublications = [
    { name: "AdvokatWatch", url: "advokatwatch.no" },
    { name: "EiendomsWatch", url: "eiendomswatch.no" },
    { name: "EnergiWatch", url: "energiwatch.no" },
    { name: "FinansWatch", url: "finanswatch.no" },
    { name: "HandelsWatch", url: "handelswatch.no" },
    { name: "MatvareWatch", url: "matvarewatch.no" },
    { name: "Medier24", url: "m24.no" },
    { name: "KOM24", url: "kom24.no" },
    { name: "MedWatch", url: "medwatch.no" }
  ];

  for (const pub of watchPublications) {
    const pubCompany = await storage.createCompany({
      name: pub.name,
      industry: "Media",
      description: `Business news publication focusing on ${pub.name}.`,
      website: `https://${pub.url}`
    });

    // Same address as Watch Media Norway
    await storage.createOffice({
      companyId: pubCompany.id,
      countryId: no.id,
      city: "Oslo",
      lat: 59.9127,
      lng: 10.7445,
      type: "HQ"
    });

    await storage.createRelationship({
      sourceCompanyId: watchMediaNO.id,
      targetCompanyId: pubCompany.id,
      type: "Ownership",
      percentage: 100,
      description: "Publication owned by Watch Media Norway."
    });
  }

  // 3. Amedia and subsidiaries
  const amedia = await storage.createCompany({
    name: "Amedia",
    industry: "Media",
    description: "Leading Norwegian media group owning local and regional newspapers.",
    website: "https://www.amedia.no"
  });

  // Amedia HQ
  await storage.createOffice({ 
    companyId: amedia.id, 
    countryId: no.id, 
    city: "Oslo", 
    lat: 59.9111, 
    lng: 10.7628, 
    type: "HQ" 
  });

  const subsidiaries = [
    { name: "Avisa Nordland", city: "Bodø", lat: 67.2804, lng: 14.3921 },
    { name: "Avisa Oslo", city: "Oslo", lat: 59.9152, lng: 10.7523 },
    { name: "Avisen Agder", city: "Flekkefjord", lat: 58.2974, lng: 6.6625 },
    { name: "Bergensavisen", city: "Bergen", lat: 60.3949, lng: 5.3283 },
    { name: "Bladet Vesterålen", city: "Sortland", lat: 68.6961, lng: 15.4131 },
    { name: "Budstikka", city: "Lysaker", lat: 59.9142, lng: 10.6358 },
    { name: "Bygdebladet", city: "Sykkylven", lat: 62.3922, lng: 6.5828 },
    { name: "Bygdeposten", city: "Mjøndalen", lat: 59.7504, lng: 10.0125 },
    { name: "Dalane Tidende", city: "Egersund", lat: 58.4517, lng: 5.9997 },
    { name: "Drammens Tidende", city: "Drammen", lat: 59.7439, lng: 10.2045 },
    { name: "Eidsvoll Ullensaker Blad", city: "Eidsvoll", lat: 60.3298, lng: 11.2635 },
    { name: "Enebakk Avis", city: "Enebakk", lat: 59.7628, lng: 11.1119 },
    { name: "Fanaposten", city: "Nesttun", lat: 60.3204, lng: 5.3524 },
    { name: "Finnmark Dagblad", city: "Hammerfest", lat: 70.6631, lng: 23.6821 },
    { name: "Finnmarken", city: "Kirkenes", lat: 69.7271, lng: 30.0453 },
    { name: "Firdaposten", city: "Florø", lat: 61.5996, lng: 5.0328 },
    { name: "Fredriksstad Blad", city: "Fredrikstad", lat: 59.2105, lng: 10.9348 },
    { name: "Fremover", city: "Narvik", lat: 68.4385, lng: 17.4272 },
    { name: "Gjengangeren", city: "Horten", lat: 59.4162, lng: 10.4854 },
    { name: "Gjesdalbuen", city: "Ålgård", lat: 58.7667, lng: 5.8500 },
    { name: "Glåmdalen", city: "Kongsvinger", lat: 60.1894, lng: 12.0125 },
    { name: "Gudbrandsdølen Dagningen", city: "Lillehammer", lat: 61.1153, lng: 10.4662 },
    { name: "Hadeland", city: "Gran", lat: 60.3881, lng: 10.5135 },
    { name: "Halden Arbeiderblad", city: "Halden", lat: 59.1248, lng: 11.3875 },
    { name: "Hamar Arbeiderblad", city: "Hamar", lat: 60.7945, lng: 11.0680 },
    { name: "Hammerfestingen", city: "Hammerfest", lat: 70.6625, lng: 23.6815 },
    { name: "Hardanger Folkeblad", city: "Odda", lat: 60.0683, lng: 6.5458 },
    { name: "Haugesunds Avis", city: "Haugesund", lat: 59.4132, lng: 5.2711 }
  ];

  for (const sub of subsidiaries) {
    const subCompany = await storage.createCompany({
      name: sub.name,
      industry: "Media",
      description: `Local newspaper in ${sub.city}, part of Amedia group.`,
      website: `https://www.${sub.name.toLowerCase().replace(/ /g, "")}.no`
    });

    await storage.createOffice({
      companyId: subCompany.id,
      countryId: no.id,
      city: sub.city,
      lat: sub.lat,
      lng: sub.lng,
      type: "HQ"
    });

    await storage.createRelationship({
      sourceCompanyId: amedia.id,
      targetCompanyId: subCompany.id,
      type: "Ownership",
      percentage: 100,
      description: "Wholly owned subsidiary."
    });
  }

  // 4. Berlingske Media (Owned by Amedia)
  const berlingske = await storage.createCompany({
    name: "Berlingske Media",
    industry: "Media",
    description: "Major Danish media group owned by Amedia.",
    website: "https://www.berlingskemedia.dk"
  });

  await storage.createOffice({
    companyId: berlingske.id,
    countryId: dk.id,
    city: "Copenhagen",
    lat: 55.6811,
    lng: 12.5815,
    type: "HQ"
  });

  await storage.createRelationship({
    sourceCompanyId: amedia.id,
    targetCompanyId: berlingske.id,
    type: "Ownership",
    percentage: 100,
    description: "Wholly owned subsidiary."
  });

  // 5. Polaris Media and subsidiaries
  const polaris = await storage.createCompany({
    name: "Polaris Media",
    industry: "Media",
    description: "Major Norwegian media group focusing on regional and local newspapers.",
    website: "https://www.polarismedia.no"
  });

  await storage.createOffice({
    companyId: polaris.id,
    countryId: no.id,
    city: "Trondheim",
    lat: 63.4305,
    lng: 10.3951,
    type: "HQ"
  });

  const polarisSubs = [
    { name: "Adresseavisen", city: "Trondheim", lat: 63.4305, lng: 10.3951 },
    { name: "Fædrelandsvennen", city: "Kristiansand", lat: 58.1467, lng: 7.9949 },
    { name: "Agderposten", city: "Arendal", lat: 58.4608, lng: 8.7663 },
    { name: "Varden", city: "Skien", lat: 59.2096, lng: 9.6090 },
    { name: "Sunnmørsposten", city: "Ålesund", lat: 62.4722, lng: 6.1549 },
    { name: "Romsdals Budstikke", city: "Molde", lat: 62.7375, lng: 7.1591 },
    { name: "iTromsø", city: "Tromsø", lat: 69.6492, lng: 18.9553 },
    { name: "Harstad Tidende", city: "Harstad", lat: 68.7986, lng: 16.5415 },
    { name: "Altaposten", city: "Alta", lat: 69.9689, lng: 23.2716 },
    { name: "Troms Folkeblad", city: "Finnsnes", lat: 69.2307, lng: 17.9827 },
    { name: "Andøyposten", city: "Andenes", lat: 69.3143, lng: 16.1194 },
    { name: "Brønnøysunds Avis", city: "Brønnøysund", lat: 65.4744, lng: 12.2033 },
    { name: "Fosna-Folket", city: "Rissa", lat: 63.5843, lng: 10.0116 },
    { name: "Hitra-Frøya", city: "Hitra", lat: 63.6067, lng: 8.9744 },
    { name: "Gauldalsposten", city: "Levanger", lat: 63.7464, lng: 11.2995 },
    { name: "Trønderbladet", city: "Melhus", lat: 63.2847, lng: 10.2797 },
    { name: "Vikebladet Vestposten", city: "Ulsteinvik", lat: 62.3432, lng: 5.8486 },
    { name: "Driva", city: "Sunndalsøra", lat: 62.6753, lng: 8.5639 },
    { name: "Åndalsnes Avis", city: "Åndalsnes", lat: 62.5675, lng: 7.6874 },
    { name: "Fjordenes Tidende", city: "Måløy", lat: 61.9355, lng: 5.1136 }
  ];

  for (const sub of polarisSubs) {
    const subCompany = await storage.createCompany({
      name: sub.name,
      industry: "Media",
      description: `Regional newspaper part of Polaris Media.`,
      website: `https://www.${sub.name.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/\s+/g, '')}.no`
    });

    await storage.createOffice({
      companyId: subCompany.id,
      countryId: no.id,
      city: sub.city,
      lat: sub.lat,
      lng: sub.lng,
      type: "HQ"
    });

    await storage.createRelationship({
      sourceCompanyId: polaris.id,
      targetCompanyId: subCompany.id,
      type: "Ownership",
      percentage: 100,
      description: "Wholly owned subsidiary."
    });
  }

  // 6. Schibsted and subsidiaries
  const schibsted = await storage.createCompany({
    name: "Schibsted",
    industry: "Media",
    description: "Major Nordic media group.",
    website: "https://schibsted.com"
  });

  // Akersgata 55, Oslo
  const akersgata55 = { lat: 59.9161, lng: 10.7431 };

  await storage.createOffice({
    companyId: schibsted.id,
    countryId: no.id,
    city: "Oslo",
    lat: akersgata55.lat,
    lng: akersgata55.lng,
    type: "HQ"
  });

  const schibstedSubs = [
    { name: "VG (Verdens Gang)", country: no, city: "Oslo", lat: akersgata55.lat, lng: akersgata55.lng },
    { name: "Aftenposten", country: no, city: "Oslo", lat: akersgata55.lat, lng: akersgata55.lng },
    { name: "Bergens Tidende", country: no, city: "Bergen", lat: 60.3894, lng: 5.3333 },
    { name: "Stavanger Aftenblad", country: no, city: "Stavanger", lat: 58.9700, lng: 5.7331 },
    { name: "E24", country: no, city: "Oslo", lat: akersgata55.lat, lng: akersgata55.lng },
    { name: "Aftonbladet", country: se, city: "Stockholm", lat: 59.3306, lng: 18.0544 },
    { name: "Svenska Dagbladet", country: se, city: "Stockholm", lat: 59.3251, lng: 18.0744 },
    { name: "TV4 Media", country: se, city: "Stockholm", lat: 59.3792, lng: 17.9397 }
  ];

  for (const sub of schibstedSubs) {
    const subCompany = await storage.createCompany({
      name: sub.name,
      industry: "Media",
      description: `Part of Schibsted group.`,
      website: `https://www.schibsted.com`
    });

    await storage.createOffice({
      companyId: subCompany.id,
      countryId: sub.country.id,
      city: sub.city,
      lat: sub.lat,
      lng: sub.lng,
      type: "HQ"
    });

    await storage.createRelationship({
      sourceCompanyId: schibsted.id,
      targetCompanyId: subCompany.id,
      type: "Ownership",
      percentage: 100,
      description: "Wholly owned subsidiary."
    });
  }

  // 7. Norweco Joint Venture
  const norweco = await storage.createCompany({
    name: "Norweco",
    industry: "Media",
    description: "Holding company owned by Watch Media Norway and Schibsted.",
    website: "https://norweco.no"
  });

  await storage.createOffice({
    companyId: norweco.id,
    countryId: no.id,
    city: "Oslo",
    lat: akersgata55.lat,
    lng: akersgata55.lng,
    type: "HQ"
  });

  await storage.createRelationship({
    sourceCompanyId: watchMediaNO.id,
    targetCompanyId: norweco.id,
    type: "Ownership",
    percentage: 80,
    description: "Majority shareholder."
  });

  await storage.createRelationship({
    sourceCompanyId: schibsted.id,
    targetCompanyId: norweco.id,
    type: "Ownership",
    percentage: 20,
    description: "Minority shareholder."
  });

  const shifter = await storage.createCompany({
    name: "Shifter Media",
    industry: "Media",
    description: "Business news publication focusing on startups and technology.",
    website: "https://shifter.no"
  });

  await storage.createOffice({
    companyId: shifter.id,
    countryId: no.id,
    city: "Oslo",
    lat: akersgata55.lat,
    lng: akersgata55.lng,
    type: "HQ"
  });

  await storage.createRelationship({
    sourceCompanyId: norweco.id,
    targetCompanyId: shifter.id,
    type: "Ownership",
    percentage: 100,
    description: "Wholly owned subsidiary of Norweco."
  });

  console.log("Database seeded successfully!");
}

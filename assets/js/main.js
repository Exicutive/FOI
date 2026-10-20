"use strict";
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.property-card');
const emptyState = document.querySelector('.empty-state');
const propertySearch = document.querySelector('#property-search');
const searchSummary = document.querySelector('#search-summary');
const siteOrigin = 'https://www.foidevs.com';
const savedPropertiesStorageKey = 'foi-saved-properties';
function getSavedProperties() {
    try {
        const stored = JSON.parse(window.localStorage.getItem(savedPropertiesStorageKey) ?? '[]');
        return new Set(Array.isArray(stored) ? stored.filter((slug) => typeof slug === 'string') : []);
    }
    catch {
        return new Set();
    }
}
function saveProperties(savedProperties) {
    try {
        window.localStorage.setItem(savedPropertiesStorageKey, JSON.stringify([...savedProperties]));
    }
    catch {
        // Saving is optional: the site remains usable when browser storage is unavailable.
    }
}
let savedProperties = getSavedProperties();
function propertySlugForSaveButton(button) {
    return button.dataset.propertySlug ?? button.closest('.property-card[data-slug]')?.dataset.slug;
}
function syncSavedProperties() {
    document.querySelectorAll('.save-button').forEach((button) => {
        const slug = propertySlugForSaveButton(button);
        const isSaved = Boolean(slug && savedProperties.has(slug));
        const propertyName = button.dataset.propertyName ?? button.closest('.property-card')?.querySelector('h3')?.textContent?.trim() ?? 'this property';
        button.classList.toggle('is-saved', isSaved);
        button.textContent = isSaved ? '♥' : '♡';
        button.setAttribute('aria-pressed', String(isSaved));
        button.setAttribute('aria-label', `${isSaved ? 'Remove' : 'Save'} ${propertyName}`);
        button.title = isSaved ? 'Remove from saved properties' : 'Save this property';
    });
    document.querySelectorAll('[data-saved-count]').forEach((element) => {
        element.textContent = String(savedProperties.size);
    });
}
function toggleSavedProperty(slug) {
    if (savedProperties.has(slug))
        savedProperties.delete(slug);
    else
        savedProperties.add(slug);
    saveProperties(savedProperties);
    syncSavedProperties();
}
function setVisibleProperties(matches) {
    let visible = 0;
    cards.forEach((card) => {
        const show = matches(card);
        card.classList.toggle('is-hidden', !show);
        if (show)
            visible += 1;
    });
    if (emptyState)
        emptyState.hidden = visible > 0;
    return visible;
}
filters.forEach((filter) => filter.addEventListener('click', () => {
    filters.forEach((button) => button.classList.remove('active'));
    filter.classList.add('active');
    const type = filter.dataset.filter ?? 'all';
    const visible = setVisibleProperties((card) => type === 'all' || (type === 'saved' ? savedProperties.has(card.dataset.slug ?? '') : card.dataset.kind === type));
    if (searchSummary)
        searchSummary.textContent = type === 'saved' && visible === 0 ? 'You have not saved any properties yet.' : `Showing ${visible} selected opportunit${visible === 1 ? 'y' : 'ies'}`;
}));
if (propertySearch) {
    propertySearch.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = new FormData(propertySearch);
        const location = String(form.get('location') ?? 'all');
        const type = String(form.get('type') ?? 'all');
        const budget = String(form.get('budget') ?? 'all');
        const visible = setVisibleProperties((card) => (location === 'all' || card.dataset.location === location) &&
            (type === 'all' || card.dataset.kind === type) &&
            (budget === 'all' || card.dataset.budget === budget));
        filters.forEach((button) => button.classList.toggle('active', type !== 'all' && button.dataset.filter === type));
        if (type === 'all')
            filters.forEach((button) => button.classList.toggle('active', button.dataset.filter === 'all'));
        if (searchSummary)
            searchSummary.textContent = visible ? `Showing ${visible} matching opportunit${visible === 1 ? 'y' : 'ies'}` : 'No exact matches — an advisor can help source the right opportunity.';
        document.querySelector('#listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}
document.addEventListener('click', (event) => {
    const button = event.target.closest('.save-button');
    if (!button)
        return;
    event.preventDefault();
    event.stopPropagation();
    const slug = propertySlugForSaveButton(button);
    if (slug)
        toggleSavedProperty(slug);
});
window.addEventListener('storage', (event) => {
    if (event.key !== savedPropertiesStorageKey)
        return;
    savedProperties = getSavedProperties();
    syncSavedProperties();
});
const propertyCollection = {
    'tmlse': {
        name: 'The Marbella Luxury & Smart Estate', type: 'Land', location: 'Lekki-Epe Expressway', price: 'From ₦86.5M', priceOptions: [['300 sqm', '₦86,500,000'], ['500 sqm', '₦109,500,000'], ['1,000 sqm · Commercial', '₦250,000,000']], status: 'AVAILABLE NOW',
        facts: ['Home', 'For Sale'],
        description: 'The Marbella Luxury & Smart Estate offers premium living along the Lekki-Epe Expressway, combining modern amenities with a serene environment. Government-allocated land, represented as free from known encumbrances and adverse claims, makes Marbella a destination where luxury meets peace of mind.',
        amenities: ['24hr Security', 'Swimming Pool', 'Electricity', 'Perimeter Fencing', 'Shopping Mall', 'Good Drainage System'],
        summary: [['Type', 'Estate land'], ['Status', 'For sale'], ['Smallest plot', '300 sqm'], ['Largest plot', '1,000 sqm commercial'], ['Price', 'From ₦86.5M'], ['Location', 'Lekki-Epe Expressway']],
        images: ['../assets/images/tmlse-1.jpg', '../assets/images/tmlse-2.jpg', '../assets/images/tmlse-3.jpg']
    },
    'tfgse': {
        name: 'The Fairmont Green & Smart Estate', type: 'Land', location: 'Ibeju-Lekki, Lagos', price: 'From ₦18M', priceOptions: [['300 sqm', '₦18,000,000'], ['500 sqm', '₦30,000,000']], status: 'AVAILABLE NOW', facts: ['Home', 'For Sale', 'C of O'],
        description: 'The estate is eco-friendly which is strategically located along the Lekki-Epe Expressway, opposite the proposed Lagos International Airport, the estate is surrounded by major economic and industrial developments, including Lekki Free Trade Zone, Lekki Deep Sea Port, Dangote Refinery and Petrochemicals, Pan-Atlantic University, Coscharis Group, and Alaro City.',
        amenities: ['EV charging port', 'Electricity', 'Solar Powered', 'Renewable Energy', 'Recreational centre', 'Motorable & Accessible Roads', 'Safe and Secured', 'Green Area'],
        summary: [['Type', 'Land'], ['Status', 'For sale'], ['Smallest plot', '300 sqm'], ['Largest plot', '500 sqm'], ['Location', 'Ibeju-Lekki, Lagos']],
        images: ['../assets/images/tfgse-1.JPG', '../assets/images/tfgse-2.JPG', '../assets/images/tfgse-3.jpg']
    },
    'mbe': {
        name: 'Meridian Boulevard Estate', type: 'Land', location: 'Okun-Ajah, Ogombo, Lagos', price: 'SALES CLOSED', status: 'Sold', facts: ['Home', 'Sold', 'C of O'],
        description: 'Meridian Boulevard Estate, located in Okun-Ajah, Ogombo, Lagos, is now fully sold out. Situated within Lagos’s rapidly developing premium real estate corridor, the estate offered early investors an opportunity to benefit from the area’s growth.',
        amenities: ['Green Area', 'Electricity', 'Safe and Secured', 'Motorable & Accessible Roads', 'Swimming pool', 'Water Treatment Plant'],
        images: ['../assets/images/mbe-1.webp', '../assets/images/mbe-2.webp', '../assets/images/mbe-3.jpp']
    },
    'qpe': {
        name: 'Queens Park Estate Phase 2', type: 'Land', location: 'Mowe-Ofada, Ogun', price: 'From ₦7.5M', status: 'Available now', facts: ['Home', 'For Sale', 'C of O'], priceOptions: [['600 sqm', '₦7,500,000']],
        description: 'Queens Park Estate Phase 2 is a residential land opportunity in Mowe-Ofada, Ogun State. It offers a 600 sqm plot within an accessible setting for buyers planning a private home or long-term property investment.',
        amenities: ['Electricity', 'Recreational centre', 'Estate Gate House', 'Perimeter Fencing', 'Green Area', 'Motorable & Accessible'],
        summary: [['Type', 'Land'], ['Status', 'For sale'], ['Land area', '600 sqm']],
        images: ['../assets/images/qpe-1.JPG', '../assets/images/qpe-2.jpg', '../assets/images/qpe-3.JPG']
    },
    'oge': {
        name: 'Oakville Green Estate', type: 'Land', location: 'Mowe-Ofada, Ogun', price: 'From ₦4.5M', status: 'Available now', facts: ['Home', 'For Sale', 'C of O'],
        description: 'Oakville Green Estate is a residential land development in Mowe-Ofada, Ogun State, offering a serene environment and promising investment opportunities. Strategically located near Sagamu Interchange, the estate is surrounded by major businesses, including International Breweries, Nestlé Foods Plc, Olam Plc, and Eterna Plc. With ongoing development in the area and flexible payment plans of up to 18 months, Oakville Green Estate offers an opportunity to invest in a growing property market.',
        amenities: ['Gated Estate', 'Drainage System', '24hr Security', '24/7 surveillance', 'Perimeter fencing', 'Advanced security systems', 'Electricity', 'Street lights'],
        summary: [['Type', 'Land'], ['Status', 'For sale'], ['Smallest plot', '300 sqm'], ['Largest plot', '500 sqm'], ['Location', 'Mowe-Ofada, Ogun']],
        images: ['../assets/images/oge-1.jpg', '../assets/images/oge-2.jpg', '../assets/images/oge-3.jpg']
    },
    'ctv': {
        name: 'Cityview Park & Resort', type: 'Land', location: 'Gousa District, Abuja', price: 'From ₦14M', priceOptions: [['200 sqm', '₦14,000,000'], ['300 sqm', '₦21,000,000'], ['500 sqm', '₦35,000,000'], ['1000 sqm - residential', '₦70,000,000'], ['1000 sqm - commercial', '₦150,000,000']], status: 'Available now', facts: ['Home', 'For Sale', 'FCDA', 'C of O'],
        description: 'City View Park & Resort is a thoughtfully situated residential development in Gousa District, Abuja, designed for comfortable living in a calm and accessible environment. Its location offers a balance between residential tranquillity and everyday convenience, with key destinations such as the University of Abuja, Nnamdi Azikiwe International Airport, Idu Train Station, the Immigration Office, and the WAEC Office within reach. The estate presents an appealing setting for individuals and families seeking a well-connected place to call home.',
        amenities: ['Golf club', 'Helipad', 'Mini Golf course', 'Electric car charger port', 'Artificial Intelligence Hub', 'Recreational Centre', "Mini Polo Course"],
        summary: [['Type', 'Land'], ['Status', 'For sale'], ['Area', '200 sqm - Acres'], ['Smallest plot', '200 sqm'], ['Largest plot', '1,000 sqm commercial & Residential'], ['Location', 'Gousa District, Abuja']],
        images: ['../assets/images/ctv-1.jpg', '../assets/images/ctv-2.jpg', '../assets/images/ctv-3.jpg']
    }
};
function propertyHref(slug) {
    return `/property/${encodeURIComponent(slug)}`;
}
function openProperty(card) {
    const slug = card.dataset.slug;
    if (slug)
        window.location.href = propertyHref(slug);
}
document.querySelectorAll('.property-card[data-slug]').forEach((card) => {
    card.addEventListener('click', (event) => {
        if (event.target.closest('button, a, input, select, textarea'))
            return;
        openProperty(card);
    });
    card.addEventListener('keydown', (event) => {
        if (event.target.closest('button, a, input, select, textarea'))
            return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openProperty(card);
        }
    });
});
function setText(id, value) {
    const element = document.getElementById(id);
    if (element)
        element.textContent = value;
}
function ensureMeta(attribute, key, content) {
    let meta = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, key);
        document.head.append(meta);
    }
    meta.content = content;
}
function canonicalPageUrl(cleanPath) {
    const url = new URL(window.location.href);
    const legacyPathMap = {
        '/index.html': '/',
        '/pages/about.html': '/about',
        '/pages/contact.html': '/contact',
        '/pages/development.html': '/development',
        '/pages/properties.html': '/properties',
    };
    const path = cleanPath ?? legacyPathMap[url.pathname] ?? url.pathname;
    return new URL(path, siteOrigin).href;
}
function shortenDescription(description) {
    const normalized = description.replace(/\s+/g, ' ').trim();
    if (normalized.length <= 160)
        return normalized;
    return `${normalized.slice(0, 157).replace(/\s+\S*$/, '')}...`;
}
function pageSchemaType() {
    const normalizedPath = window.location.pathname.replace(/\/$/, '').replace(/^\/pages\//, '/');
    const pageTypes = {
        '/about': 'AboutPage',
        '/about.html': 'AboutPage',
        '/contact': 'ContactPage',
        '/contact.html': 'ContactPage',
        '/properties': 'CollectionPage',
        '/properties.html': 'CollectionPage',
    };
    return pageTypes[normalizedPath] ?? 'WebPage';
}
function syncStructuredData(title, description, canonicalUrl) {
    const agentId = `${siteOrigin}/#real-estate-agent`;
    const websiteId = `${siteOrigin}/#website`;
    const business = {
        '@type': 'RealEstateAgent',
        '@id': agentId,
        name: 'FOI Developments',
        legalName: 'FOI Developments Ltd',
        url: `${siteOrigin}/`,
        logo: `${siteOrigin}/assets/images/foi-logo-mark.png`,
        image: `${siteOrigin}/assets/images/tmlse-1.jpg`,
        email: 'info@foidevs.com',
        telephone: '+234 813 858 2155',
        contactPoint: [{
                '@type': 'ContactPoint',
                telephone: '+234 707 621 2073',
                contactType: 'customer service',
                areaServed: 'NG',
                availableLanguage: 'en',
            }],
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'No. 2, Akabogu Street, Lagos Business School',
            addressLocality: 'Ajah',
            addressRegion: 'Lagos',
            addressCountry: 'NG',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 6.472829393518931,
            longitude: 3.6009813745294896,
        },
        openingHoursSpecification: [{
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                    'https://schema.org/Monday',
                    'https://schema.org/Tuesday',
                    'https://schema.org/Wednesday',
                    'https://schema.org/Thursday',
                    'https://schema.org/Friday',
                    'https://schema.org/Saturday',
                    'https://schema.org/Sunday',
                ],
                opens: '00:00',
                closes: '23:59',
            }],
    };
    const data = {
        '@context': 'https://schema.org',
        '@graph': [
            business,
            { '@type': 'WebSite', '@id': websiteId, url: `${siteOrigin}/`, name: 'FOI Developments', publisher: { '@id': agentId } },
            { '@type': pageSchemaType(), '@id': `${canonicalUrl}#webpage`, url: canonicalUrl, name: title, description, isPartOf: { '@id': websiteId }, about: { '@id': agentId } },
        ],
    };
    let script = document.getElementById('seo-structured-data');
    if (!script) {
        script = document.createElement('script');
        script.id = 'seo-structured-data';
        script.type = 'application/ld+json';
        document.head.append(script);
    }
    script.textContent = JSON.stringify(data);
}
function syncPageMetadata(title, description, image, cleanPath) {
    const shortDescription = shortenDescription(description);
    const canonicalUrl = canonicalPageUrl(cleanPath);
    const imageUrl = image ? new URL(image, siteOrigin).href : undefined;
    document.title = title;
    ensureMeta('name', 'description', shortDescription);
    ensureMeta('property', 'og:title', title);
    ensureMeta('property', 'og:description', shortDescription);
    ensureMeta('property', 'og:type', 'website');
    ensureMeta('property', 'og:site_name', 'FOI Developments');
    ensureMeta('name', 'twitter:card', 'summary_large_image');
    ensureMeta('name', 'twitter:title', title);
    ensureMeta('name', 'twitter:description', shortDescription);
    if (imageUrl) {
        ensureMeta('property', 'og:image', imageUrl);
        ensureMeta('property', 'og:image:alt', title);
        ensureMeta('name', 'twitter:image', imageUrl);
    }
    if (canonicalUrl) {
        ensureMeta('property', 'og:url', canonicalUrl);
        let canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.append(canonical);
        }
        canonical.href = canonicalUrl;
        syncStructuredData(title, shortDescription, canonicalUrl);
    }
}
const initialDescription = document.querySelector('meta[name="description"]')?.content ?? '';
syncPageMetadata(document.title, initialDescription);
function renderPropertyDetail() {
    const page = document.getElementById('property-page');
    if (!page)
        return;
    const detailSlug = window.location.pathname.match(/^\/property\/([^/]+)\/?$/)?.[1];
    const slug = new URLSearchParams(window.location.search).get('property') ?? (detailSlug ? decodeURIComponent(detailSlug) : 'tmlse');
    const property = propertyCollection[slug] ?? propertyCollection['tmlse'];
    const title = `${property.name} in ${property.location} | FOI Developments`;
    syncPageMetadata(title, `${property.name} in ${property.location}. ${property.description}`, property.images[0], `/property/${encodeURIComponent(slug)}`);
    setText('property-name', property.name);
    setText('property-type', property.type);
    setText('property-location', property.location);
    setText('property-price', property.price);
    setText('property-status', property.status);
    setText('property-description', property.description);
    const detailSave = document.querySelector('.detail-save');
    if (detailSave) {
        detailSave.dataset.propertySlug = slug;
        detailSave.dataset.propertyName = property.name;
    }
    const facts = document.getElementById('property-facts');
    if (facts)
        facts.innerHTML = property.facts.map((fact) => `<span>${fact}</span>`).join('');
    const priceOptions = document.getElementById('property-price-options');
    const priceOptionsList = document.getElementById('property-price-options-list');
    if (priceOptions && priceOptionsList) {
        const hasPriceOptions = Boolean(property.priceOptions?.length);
        priceOptions.hidden = !hasPriceOptions;
        priceOptionsList.innerHTML = property.priceOptions?.map(([size, price]) => `<article><span>${size}</span><strong>${price}</strong></article>`).join('') ?? '';
    }
    const amenities = document.getElementById('property-amenities-list');
    if (amenities)
        amenities.innerHTML = property.amenities.map((amenity) => `<li>${amenity}</li>`).join('');
    const summarySection = document.getElementById('property-summary');
    const summary = document.getElementById('property-summary-list');
    const summaryItems = property.summary ?? [];
    if (summary)
        summary.innerHTML = summaryItems.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    if (summarySection)
        summarySection.hidden = summaryItems.length === 0;
    const image = document.getElementById('gallery-image');
    const thumbnails = document.getElementById('gallery-thumbnails');
    let activeImage = 0;
    const showImage = (index) => {
        activeImage = (index + property.images.length) % property.images.length;
        if (image) {
            image.src = property.images[activeImage];
            image.alt = `${property.name} — image ${activeImage + 1}`;
        }
        thumbnails?.querySelectorAll('button').forEach((button, buttonIndex) => button.classList.toggle('active', buttonIndex === activeImage));
    };
    if (thumbnails) {
        thumbnails.innerHTML = property.images.map((src, index) => `<button type="button" aria-label="View image ${index + 1}"><img src="${src}" alt="" /></button>`).join('');
        thumbnails.querySelectorAll('button').forEach((button, index) => button.addEventListener('click', () => showImage(index)));
    }
    showImage(0);
    document.querySelector('.gallery-next')?.addEventListener('click', () => showImage(activeImage + 1));
    const whatsapp = document.getElementById('whatsapp-link');
    if (whatsapp)
        whatsapp.href = `https://wa.me/2348138582155?text=${encodeURIComponent(`Hello FOI, I’m interested in ${property.name}.`)}`;
    const similar = document.getElementById('similar-properties');
    if (similar) {
        similar.innerHTML = Object.entries(propertyCollection).filter(([key]) => key !== slug).slice(0, 3).map(([key, item]) => `<article class="property-card similar-card" data-slug="${key}" tabindex="0" role="link" aria-label="View ${item.name} details"><div class="property-photo"><img src="${item.images[0]}" alt="${item.name}" loading="lazy" decoding="async" /><button class="save-button" type="button" aria-label="Save ${item.name}">♡</button></div><div class="property-details"><div><p>${item.type}</p><h3>${item.name}</h3><span>${item.facts.join(' · ')}</span></div><strong>${item.price}</strong></div></article>`).join('');
        similar.querySelectorAll('.property-card').forEach((card) => {
            card.addEventListener('click', (event) => {
                if (event.target.closest('button, a, input, select, textarea'))
                    return;
                openProperty(card);
            });
            card.addEventListener('keydown', (event) => {
                if (event.target.closest('button, a, input, select, textarea'))
                    return;
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openProperty(card);
                }
            });
        });
    }
    syncSavedProperties();
    page.setAttribute('aria-busy', 'false');
}
renderPropertyDetail();
syncSavedProperties();
const developmentPhases = {
    'site-feasibility': {
        phase: 'Site & feasibility', title: 'Start with the site.', sectionTitle: 'Clarity before commitment.',
        lead: 'A successful development begins with a measured understanding of its site, its constraints, and its potential.',
        body: 'Before design moves forward, we help establish what a site can realistically become. Our early-stage review brings land conditions, planning context, access, services, and commercial potential into one decision-making picture—so investment and design choices have a clear foundation.',
        image: '../assets/images/swts.jpeg',
        deliverables: ['Site and access review', 'Planning and zoning context', 'Infrastructure assessment', 'Initial feasibility direction', 'Risk and opportunity register', 'Development brief inputs'],
        steps: [['Understand', 'Review your ambition, commercial priorities, and the context around the site.'], ['Assess', 'Identify physical, regulatory, and infrastructure conditions that shape viability.'], ['Align', 'Set a clear feasibility direction before committing to design or construction.']]
    },
    'design-approvals': {
        phase: 'Design & approvals', title: 'Coordinate the details.', sectionTitle: 'A brief that holds together.',
        lead: 'We coordinate the decisions between aspiration and execution, bringing design, cost, and approvals into alignment.',
        body: 'Good development coordination gives every consultant a shared frame of reference. We help translate project goals into a disciplined brief, coordinate the right technical inputs, and maintain sight of costs, programme, and approvals as a concept becomes a buildable plan.',
        image: '../assets/images/ctd.jpeg',
        deliverables: ['Development brief', 'Consultant coordination', 'Design review checkpoints', 'Cost-plan alignment', 'Approvals programme', 'Tender readiness support'],
        steps: [['Define', 'Turn requirements into a concise, coordinated design and delivery brief.'], ['Coordinate', 'Bring architecture, engineering, planning, and cost inputs together.'], ['Prepare', 'Create the documentation and approval pathway needed to move forward.']]
    },
    'construction-handover': {
        phase: 'Construction & handover', title: 'Build with oversight.', sectionTitle: 'Keep the finished asset in view.',
        lead: 'Careful oversight through construction protects the intent of the brief and prepares the asset for a confident handover.',
        body: 'We bring a client-side perspective to the delivery phase, creating useful checkpoints around progress, quality, variation, and readiness. As the project nears completion, we help focus attention on close-out and the practical details that make the finished place ready to occupy, lease, or sell.',
        image: '../assets/images/bwo.jpeg',
        deliverables: ['Progress review meetings', 'Quality checkpoint support', 'Cost and variation visibility', 'Programme monitoring', 'Practical completion planning', 'Handover and close-out readiness'],
        steps: [['Monitor', 'Review progress against the brief, programme, budget, and quality expectations.'], ['Resolve', 'Keep key decisions, issues, and changes visible and moving forward.'], ['Handover', 'Prepare for a considered close-out and a finished asset ready for use.']]
    }
};
function developmentHref(slug) {
    return `/development/${encodeURIComponent(slug)}`;
}
function renderDevelopmentDetail() {
    if (!document.getElementById('development-detail-page'))
        return;
    const detailSlug = window.location.pathname.match(/^\/development\/([^/]+)\/?$/)?.[1];
    const slug = new URLSearchParams(window.location.search).get('phase') ?? (detailSlug ? decodeURIComponent(detailSlug) : 'site-feasibility');
    const phase = developmentPhases[slug] ?? developmentPhases['site-feasibility'];
    const title = `${phase.title} | Property Development Services | FOI Developments`;
    syncPageMetadata(title, phase.lead, phase.image, `/development/${encodeURIComponent(slug)}`);
    setText('development-phase', phase.phase);
    setText('development-title', phase.title);
    setText('development-section-title', phase.sectionTitle);
    setText('development-lead', phase.lead);
    setText('development-body', phase.body);
    const image = document.getElementById('development-image');
    if (image) {
        image.src = phase.image;
        image.alt = phase.title;
    }
    const deliverables = document.getElementById('development-deliverables-list');
    if (deliverables)
        deliverables.innerHTML = phase.deliverables.map((item) => `<li>${item}</li>`).join('');
    const steps = document.getElementById('development-steps');
    if (steps)
        steps.innerHTML = phase.steps.map(([title, copy], index) => `<article><span>0${index + 1}</span><h3>${title}</h3><p>${copy}</p></article>`).join('');
}
document.querySelectorAll('.project-card[data-development]').forEach((card) => {
    const openDevelopment = () => {
        const slug = card.dataset.development;
        if (slug)
            window.location.href = developmentHref(slug);
    };
    card.addEventListener('click', openDevelopment);
    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDevelopment();
        }
    });
});
renderDevelopmentDetail();
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
        const open = mobileNav.classList.toggle('open');
        menuToggle.classList.toggle('is-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
    });
    mobileNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('open');
            menuToggle.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}
const enquiryForm = document.querySelector('.enquiry-form');
if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const message = enquiryForm.querySelector('.form-message');
        const submitButton = enquiryForm.querySelector('button[type="submit"]');
        const endpoint = enquiryForm.dataset.crmEndpoint?.trim();
        if (!endpoint) {
            if (message)
                message.textContent = 'The contact form is being set up. Please call or email us directly.';
            return;
        }
        const formData = new FormData(enquiryForm);
        const payload = {};
        formData.forEach((value, key) => {
            payload[key] = typeof value === 'string' ? value : value.name;
        });
        payload.source = 'Website contact form';
        payload.page = window.location.href;
        if (message)
            message.textContent = 'Sending your message…';
        if (submitButton)
            submitButton.disabled = true;
        try {
            await fetch(endpoint, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload),
            });
            if (message)
                message.textContent = 'Thank you. A FOI advisor will be in touch shortly.';
            enquiryForm.reset();
        }
        catch {
            if (message)
                message.textContent = 'We could not send your message. Please try again or contact us directly.';
        }
        finally {
            if (submitButton)
                submitButton.disabled = false;
        }
    });
}
document.querySelectorAll('.footer-top').forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
    });
});
document.querySelectorAll('.site-footer .footer-main > .footer-links:last-of-type').forEach((section) => {
    section.className = 'footer-contact-card';
    section.setAttribute('aria-label', 'Contact FOI Developments');
    section.innerHTML = `
    <p class="footer-card-title">Get in touch</p>
    <a class="footer-detail" href="/contact"><span class="footer-detail-icon" aria-hidden="true">⌖</span><span><small>VISIT</small><strong>No. 2, Akabogu Street, Lagos Business School, Ajah, Lagos</strong></span></a>
    <a class="footer-detail" href="tel:+2348138582155"><span class="footer-detail-icon" aria-hidden="true">⌕</span><span><small>CALL</small><strong>+234 813 858 2155</strong></span></a>
    <a class="footer-detail" href="tel:+2347076212073"><span class="footer-detail-icon" aria-hidden="true">⌕</span><span><small>CALL</small><strong>+234 707 621 2073</strong></span></a>
    <a class="footer-detail" href="mailto:info@foidevs.com"><span class="footer-detail-icon" aria-hidden="true">@</span><span><small>EMAIL</small><strong>info@foidevs.com</strong></span></a>
  `;
    const visitLink = section.querySelector('.footer-detail');
    if (visitLink)
        visitLink.href = '/contact';
});

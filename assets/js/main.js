"use strict";
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.property-card');
const emptyState = document.querySelector('.empty-state');
const propertySearch = document.querySelector('#property-search');
const searchSummary = document.querySelector('#search-summary');
const siteOrigin = 'https://www.foidevs.com';
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
    const visible = setVisibleProperties((card) => type === 'all' || card.dataset.kind === type);
    if (searchSummary)
        searchSummary.textContent = `Showing ${visible} selected opportunit${visible === 1 ? 'y' : 'ies'}`;
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
document.querySelectorAll('.save-button').forEach((button) => {
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        button.classList.toggle('is-saved');
        button.textContent = button.classList.contains('is-saved') ? '♥' : '♡';
    });
});
const propertyCollection = {
    'tmlse': {
        name: 'The Marbella Luxury & Smart Estate', type: 'Land', location: 'Lekki-Epe Expressway', price: 'Starting from ₦86.5M', priceOptions: [['300 sqm', '₦86,500,000'], ['500 sqm', '₦109,500,000'], ['1,000 sqm · Commercial', '₦250,000,000']], status: 'Featured opportunity',
        facts: ['300 sqm plots', '500 sqm plots', '1,000 sqm commercial'],
        description: 'The Marbella Luxury & Smart Estate offers premium living along the Lekki-Epe Expressway, combining modern amenities with a serene environment. Government-allocated land, represented as free from known encumbrances and adverse claims, makes Marbella a destination where luxury meets peace of mind.',
        amenities: ['24hr Security', 'Swimming Pool', 'Electricity', 'Perimeter Fencing', 'Shopping Mall', 'Good Drainage System'],
        summary: [['Type', 'Estate land'], ['Status', 'For sale'], ['Smallest plot', '300 sqm'], ['Largest plot', '1,000 sqm commercial'], ['Price', 'From ₦86.5M'], ['Location', 'Lekki-Epe Expressway']],
        images: ['../assets/images/tmlse-1.jpg', '../assets/images/tmlse-2.jpg', '../assets/images/tmlse-3.jpg']
    },
    'meridian-residence': {
        name: 'Meridian Residence', type: 'Apartment', location: 'Life Camp', price: '₦265M', status: 'Available now', facts: ['3 bedrooms', '3 bathrooms', '210 sqm'],
        description: 'Meridian Residence is an elegantly finished apartment designed for calm, effortless city living. Its thoughtful plan balances a generous open-plan living area with three quiet bedrooms, all within a well-managed Life Camp address.',
        amenities: ['Residents’ gym', 'Elevator access', 'Backup power', '24-hour security', 'Dedicated parking', 'Private balcony'],
        summary: [['Type', 'Apartment'], ['Status', 'For sale'], ['Bedrooms', '3'], ['Bathrooms', '3'], ['Internal area', '210 sqm'], ['Location', 'Life Camp']],
        images: ['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=88', 'https://images.unsplash.com/photo-1600607688960-e095ff83135c?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=85']
    },
    'the-atrium': {
        name: 'The Atrium', type: 'Commercial', location: 'Wuse II', price: 'Price on request', status: 'Available to lease', facts: ['Grade A office', '1,200 sqm', 'Prime address'],
        description: 'The Atrium offers a refined workplace in the commercial heart of Wuse II. Designed for businesses that value presence and performance, its flexible floor plate, polished arrival experience, and professional building services make it a compelling headquarters address.',
        amenities: ['High-speed elevators', 'Reception lobby', 'Backup generation', 'Secure access control', 'Ample parking', 'On-site facility management'],
        summary: [['Type', 'Grade A office'], ['Status', 'To lease'], ['Area', '1,200 sqm'], ['Parking', 'Available'], ['Power', 'Backup generation'], ['Location', 'Wuse II']],
        images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=88', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85']
    },
    'vista-terraces': {
        name: 'Vista Terraces', type: 'Land', location: 'Guzape', price: '₦190M', status: 'Available now', facts: ['Residential land', '1,850 sqm', 'Serviced area'],
        description: 'A rare residential land opportunity in fast-maturing Guzape. Vista Terraces offers the room, aspect, and infrastructure to create a substantial private home or a carefully considered boutique residential project.',
        amenities: ['Paved road access', 'Electricity connection', 'Drainage provision', 'Developing neighbourhood', 'Survey documentation', 'Secure vicinity'],
        summary: [['Type', 'Residential land'], ['Status', 'For sale'], ['Land area', '1,850 sqm'], ['Title', 'Available on request'], ['Access', 'Paved road'], ['Location', 'Guzape']],
        images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=88', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85']
    },
    'aster-court': {
        name: 'Aster Court', type: 'Townhouse', location: 'Jabi', price: '₦430M', status: 'Available now', facts: ['4 bedrooms', '4 bathrooms', '340 sqm'],
        description: 'Aster Court is a composed four-bedroom townhouse that pairs warm, finished interiors with the convenience of a central Jabi location. It is a home designed for everyday comfort, with room to host and settle in.',
        amenities: ['Fitted kitchen', 'Private garden', 'Family lounge', 'BQ', 'Estate security', 'Two-car parking'],
        summary: [['Type', 'Townhouse'], ['Status', 'For sale'], ['Bedrooms', '4'], ['Bathrooms', '4'], ['Internal area', '340 sqm'], ['Location', 'Jabi']],
        images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=88', 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85']
    },
    'one-central': {
        name: 'One Central', type: 'Commercial', location: 'Central Area', price: 'Price on request', status: 'Available to lease', facts: ['Retail & office', '680 sqm', 'Central location'],
        description: 'One Central puts a flexible retail and office opportunity at the centre of a thriving business district. Its clear visibility, modern interiors, and adaptable configuration suit a business looking to make an assured arrival.',
        amenities: ['Flexible floor plan', 'Retail frontage', 'Backup power', 'Visitor parking', 'Security desk', 'Air conditioning'],
        summary: [['Type', 'Retail & office'], ['Status', 'To lease'], ['Area', '680 sqm'], ['Visibility', 'High street frontage'], ['Power', 'Backup generation'], ['Location', 'Central Area']],
        images: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=88', 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1000&q=85', 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1000&q=85']
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
    const pathname = window.location.pathname;
    if (pathname.endsWith('/about.html'))
        return 'AboutPage';
    if (pathname.endsWith('/contact.html'))
        return 'ContactPage';
    if (pathname.endsWith('/properties.html'))
        return 'CollectionPage';
    return 'WebPage';
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
        email: 'info@foidev.com',
        telephone: ['+234 813 858 2155', '+234 707 621 2073'],
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
    document.title = title;
    ensureMeta('name', 'description', shortDescription);
    ensureMeta('property', 'og:title', title);
    ensureMeta('property', 'og:description', shortDescription);
    ensureMeta('property', 'og:type', 'website');
    ensureMeta('property', 'og:site_name', 'FOI Developments');
    ensureMeta('name', 'twitter:card', 'summary_large_image');
    ensureMeta('name', 'twitter:title', title);
    ensureMeta('name', 'twitter:description', shortDescription);
    if (image) {
        ensureMeta('property', 'og:image', image);
        ensureMeta('property', 'og:image:alt', title);
        ensureMeta('name', 'twitter:image', image);
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
    const summary = document.getElementById('property-summary-list');
    if (summary)
        summary.innerHTML = property.summary.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
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
        similar.innerHTML = Object.entries(propertyCollection).filter(([key]) => key !== slug).slice(0, 3).map(([key, item]) => `<article class="property-card similar-card" data-slug="${key}" tabindex="0" role="link" aria-label="View ${item.name} details"><div class="property-photo"><img src="${item.images[0]}" alt="${item.name}" loading="lazy" decoding="async" /></div><div class="property-details"><div><p>${item.type}</p><h3>${item.name}</h3><span>${item.facts.join(' · ')}</span></div><strong>${item.price}</strong></div></article>`).join('');
        similar.querySelectorAll('.property-card').forEach((card) => {
            card.addEventListener('click', () => openProperty(card));
            card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openProperty(card);
            } });
        });
    }
}
renderPropertyDetail();
const developmentPhases = {
    'site-feasibility': {
        phase: 'Site & feasibility', title: 'Start with the site.', sectionTitle: 'Clarity before commitment.',
        lead: 'A successful development begins with a measured understanding of its site, its constraints, and its potential.',
        body: 'Before design moves forward, we help establish what a site can realistically become. Our early-stage review brings land conditions, planning context, access, services, and commercial potential into one decision-making picture—so investment and design choices have a clear foundation.',
        image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=88',
        deliverables: ['Site and access review', 'Planning and zoning context', 'Infrastructure assessment', 'Initial feasibility direction', 'Risk and opportunity register', 'Development brief inputs'],
        steps: [['Understand', 'Review your ambition, commercial priorities, and the context around the site.'], ['Assess', 'Identify physical, regulatory, and infrastructure conditions that shape viability.'], ['Align', 'Set a clear feasibility direction before committing to design or construction.']]
    },
    'design-approvals': {
        phase: 'Design & approvals', title: 'Coordinate the details.', sectionTitle: 'A brief that holds together.',
        lead: 'We coordinate the decisions between aspiration and execution, bringing design, cost, and approvals into alignment.',
        body: 'Good development coordination gives every consultant a shared frame of reference. We help translate project goals into a disciplined brief, coordinate the right technical inputs, and maintain sight of costs, programme, and approvals as a concept becomes a buildable plan.',
        image: 'https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=1600&q=88',
        deliverables: ['Development brief', 'Consultant coordination', 'Design review checkpoints', 'Cost-plan alignment', 'Approvals programme', 'Tender readiness support'],
        steps: [['Define', 'Turn requirements into a concise, coordinated design and delivery brief.'], ['Coordinate', 'Bring architecture, engineering, planning, and cost inputs together.'], ['Prepare', 'Create the documentation and approval pathway needed to move forward.']]
    },
    'construction-handover': {
        phase: 'Construction & handover', title: 'Build with oversight.', sectionTitle: 'Keep the finished asset in view.',
        lead: 'Careful oversight through construction protects the intent of the brief and prepares the asset for a confident handover.',
        body: 'We bring a client-side perspective to the delivery phase, creating useful checkpoints around progress, quality, variation, and readiness. As the project nears completion, we help focus attention on close-out and the practical details that make the finished place ready to occupy, lease, or sell.',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=88',
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
    enquiryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = enquiryForm.querySelector('.form-message');
        if (message)
            message.textContent = 'Thank you. A FOI advisor will be in touch shortly.';
        enquiryForm.reset();
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
    <a class="footer-detail" href="mailto:info@foidev.com"><span class="footer-detail-icon" aria-hidden="true">@</span><span><small>EMAIL</small><strong>info@foidev.com</strong></span></a>
  `;
    const visitLink = section.querySelector('.footer-detail');
    if (visitLink)
        visitLink.href = '/contact';
});

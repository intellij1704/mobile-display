import AboutHero from "./components/AboutHero";
import MissionVision from "./components/MissionVison";

// ✅ This is how you define metadata in plain JS (JSX syntax, not TypeScript)
export const metadata = {
    title: "About Us | Mobile Phone Spare Parts & Accessories - PhoneR",
    description:
        "Learn more about PhoneR – India’s trusted online store for mobile phone spare parts and accessories. Get to know our mission, vision, and commitment to quality service.",
    robots: "index, follow",
    alternates: {
        canonical: "https://mobiledisplay.in/about",
    },
    openGraph: {
        title: "About Us | Mobile Phone Spare Parts & Accessories - PhoneR",
        description:
            "Learn more about PhoneR – India’s trusted online store for mobile phone spare parts and accessories.",
        url: "https://mobiledisplay.in/about",
        siteName: "PhoneR Mobile Phone Spare Parts Online",
        images: [
            {
                url: "https://phoner.in/wp-content/uploads/2023/02/123-1232782_smart-phone-electronic-parts-cell-doc-mobile-repairing.png",
                width: 1852,
                height: 1010,
                alt: "Mobile Phone Spare Parts Online",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "About Us | Mobile Phone Spare Parts & Accessories - Mobile Display",
        description:
            "Learn more about mobiledisplay – India’s trusted online store for mobile phone spare parts and accessories.",
        site: "@mobiledisplaykolkata",
        creator: "@mobiledisplaykolkata",
        images: [
            "https://phoner.in/wp-content/uploads/2023/02/123-1232782_smart-phone-electronic-parts-cell-doc-mobile-repairing.png",
        ],
    },
};

export default function About() {
    return (
        <main className="min-h-screen">
            <AboutHero />
            <MissionVision />
        </main>
    );
}

import { ToolPageLayout } from "../../components/ToolPageLayout";
import { FontGeneratorTool } from "../../components/FontGeneratorTool";
import AICommentForm from "../../components/AICommentForm";
import { platformConfigs, platformList } from "../../components/platform-configs";
import {
  commentPlatformConfigs,
  commentPlatformList,
} from "../../components/comment-platform-configs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all platforms at build time
export async function generateStaticParams() {
  const fontGenerators = platformList.map((platform) => ({
    slug: `${platform.id}-font-generator`,
  }));

  const commentGenerators = commentPlatformList.map((platform) => ({
    slug: `${platform.id}-comment-generator`,
  }));

  return [...fontGenerators, ...commentGenerators];
}

// Generate metadata dynamically based on slug
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Check if it's a comment generator
  if (slug.endsWith("-comment-generator")) {
    const platformId = slug.replace("-comment-generator", "");
    const platform = commentPlatformConfigs[platformId];

    if (!platform) {
      return { title: "Comment Generator Not Found" };
    }

    return {
      title: `${platform.displayName} | AI-Powered ${platform.name} Comments`,
      description: platform.description,
      openGraph: {
        title: platform.displayName,
        description: platform.description,
        type: "website",
        url: `https://rybbit.com/tools/${platform.id}-comment-generator`,
        siteName: "Rybbit Documentation",
      },
      twitter: {
        card: "summary_large_image",
        title: platform.displayName,
        description: platform.description,
      },
      alternates: {
        canonical: `https://rybbit.com/tools/${platform.id}-comment-generator`,
      },
    };
  }

  // It's a font generator
  const platformId = slug.replace("-font-generator", "");
  const platform = platformConfigs[platformId];

  if (!platform) {
    return {
      title: "Font Generator Not Found",
    };
  }

  return {
    title: `Free ${platform.displayName} | Unicode Font Styles for ${platform.name}`,
    description: platform.description,
    openGraph: {
      title: `Free ${platform.displayName}`,
      description: platform.description,
      type: "website",
      url: `https://rybbit.com/tools/${platform.id}-font-generator`,
      siteName: "Rybbit Documentation",
    },
    twitter: {
      card: "summary_large_image",
      title: `Free ${platform.displayName}`,
      description: platform.description,
    },
    alternates: {
      canonical: `https://rybbit.com/tools/${platform.id}-font-generator`,
    },
  };
}

export default async function PlatformToolPage({ params }: PageProps) {
  const { slug } = await params;

  // Check if it's a comment generator
  if (slug.endsWith("-comment-generator")) {
    const platformId = slug.replace("-comment-generator", "");
    const platform = commentPlatformConfigs[platformId];

    // Handle invalid platform
    if (!platform) {
      notFound();
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: platform.displayName,
      description: platform.description,
      url: `https://rybbit.com/tools/${platform.id}-comment-generator`,
      applicationCategory: "Utility",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: {
        "@type": "Organization",
        name: "Rybbit",
        url: "https://rybbit.com",
      },
    };

    const educationalContent = (
      <>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          About {platform.name} Comments
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
          {platform.educationalContent}
        </p>

        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
          How to Use This Tool
        </h3>
        <ol className="space-y-2 text-neutral-700 dark:text-neutral-300 mb-6">
          <li>
            <strong>Paste the original content</strong> you want to comment on
            in the text area
          </li>
          <li>
            <strong>Select your desired tone</strong> (friendly, professional,
            humorous, etc.)
          </li>
          <li>
            <strong>Choose comment length</strong> based on your preference
          </li>
          <li>
            <strong>Click "Generate Comments"</strong> to create 3 unique
            variations
          </li>
          <li>
            <strong>Copy your favorite</strong> and paste it into{" "}
            {platform.name}
          </li>
        </ol>

        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
          Best Practices for {platform.name} Comments
        </h3>
        <ul className="space-y-2 text-neutral-700 dark:text-neutral-300 mb-6">
          <li>
            <strong>Be authentic:</strong> Even AI-generated comments should
            feel genuine and personal
          </li>
          <li>
            <strong>Add context:</strong> Reference specific parts of the
            original content
          </li>
          <li>
            <strong>Encourage dialogue:</strong> Ask questions or invite further
            discussion
          </li>
          <li>
            <strong>Match the tone:</strong> Respect the original post's mood
            and purpose
          </li>
          <li>
            <strong>Personalize before posting:</strong> Edit generated comments
            to add your unique voice
          </li>
        </ul>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-6">
          <strong>Note:</strong> While this tool generates comments using AI,
          always review and personalize them before posting. Authentic
          engagement is key to building genuine connections on {platform.name}.
        </p>
      </>
    );

    const faqs = [
      {
        question: `How does the ${platform.name} comment generator work?`,
        answer: `This tool uses AI to analyze the content you provide and generate contextually relevant comments based on your chosen tone and length preference. It considers ${platform.name}-specific best practices to create authentic, engaging responses.`,
      },
      {
        question: "Can I edit the generated comments before posting?",
        answer:
          "Absolutely! We encourage you to personalize any generated comment to match your voice and add specific details. The generated comments are starting points—your personal touch makes them truly authentic.",
      },
      {
        question: "What tones are available?",
        answer:
          "You can choose from six tones: Friendly (warm and approachable), Professional (polished and business-appropriate), Humorous (light-hearted and funny), Supportive (encouraging and empathetic), Inquisitive (curious and question-asking), and Critical (thoughtfully analytical).",
      },
      {
        question: "How many comments can I generate?",
        answer: (
          <>
            The tool generates 3 unique comment variations per request. You're
            limited to 5 requests per minute to ensure fair usage and maintain
            service quality for all users.
          </>
        ),
      },
      {
        question: "Will the comments sound natural?",
        answer: `Yes! The AI is trained to create authentic, platform-appropriate comments that match ${platform.name}'s culture and style. However, adding your personal touch will make them even more genuine and effective.`,
      },
      {
        question: "How can Rybbit help me track comment engagement?",
        answer: (
          <>
            Rybbit helps you measure which content drives the most engagement
            and comments on your social media. Track clicks, traffic sources,
            and content performance to understand what resonates with your
            audience.{" "}
            <a
              href="https://rybbit.com"
              className="text-emerald-600 hover:text-emerald-500 underline"
            >
              Start tracking for free
            </a>
            .
          </>
        ),
      },
    ];

    return (
      <ToolPageLayout
        toolSlug={`${platform.id}-comment-generator`}
        title={platform.displayName}
        description={platform.description}
        badge="AI-Powered Tool"
        toolComponent={<AICommentForm platform={platform} />}
        educationalContent={educationalContent}
        faqs={faqs}
        relatedToolsCategory="social-media"
        ctaTitle="Track engagement and comment activity with Rybbit"
        ctaDescription="Measure which content drives the most comments and engagement on your social media platforms."
        ctaEventLocation={`${platform.id}_comment_generator_cta`}
        structuredData={structuredData}
      />
    );
  }

  // It's a font generator
  const platformId = slug.replace("-font-generator", "");
  const platform = platformConfigs[platformId];

  // Handle invalid platform
  if (!platform) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: platform.displayName,
    description: platform.description,
    url: `https://rybbit.com/tools/${platform.id}-font-generator`,
    applicationCategory: "Utility",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "Rybbit",
      url: "https://rybbit.com",
    },
  };

  const educationalContent = (
    <>
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
        About {platform.name} Font Styles
      </h2>
      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
        {platform.educationalContent}
      </p>

      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
        How to Use
      </h3>
      <ol className="space-y-2 text-neutral-700 dark:text-neutral-300 mb-6">
        <li>
          <strong>Type your text</strong> in the input box above
        </li>
        <li>
          <strong>Browse the font styles</strong> that appear automatically
        </li>
        <li>
          <strong>Click "Copy"</strong> on any style you like
        </li>
        <li>
          <strong>Paste it</strong> into your {platform.name} posts, comments,
          or bio
        </li>
      </ol>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-6">
        <strong>Note:</strong> These fonts use Unicode characters and work
        across most platforms and devices. However, some fonts may not display
        correctly on older systems or certain applications.
      </p>
    </>
  );

  const fontFaqs = [
    {
      question: `How do ${platform.name} font generators work?`,
      answer: `This tool uses Unicode characters to transform your text into different font styles. Unicode includes thousands of special characters that look like styled versions of regular letters. When you type text, the generator maps each character to its Unicode equivalent in various styles.`,
    },
    {
      question: "Will these fonts work everywhere?",
      answer: `These Unicode fonts work on most modern platforms and devices, including ${platform.name}, other social media sites, messaging apps, and websites. However, some older systems or applications may not support all Unicode characters and might display them as boxes or question marks.`,
    },
    {
      question: "Can I use these fonts in my bio or username?",
      answer: `Yes! These Unicode fonts work in most text fields on ${platform.name}, including bios, usernames (where special characters are allowed), posts, comments, and messages. However, some platforms may have restrictions on special characters in certain fields.`,
    },
    {
      question: "Are these fonts safe to use?",
      answer:
        "Absolutely! These fonts use standard Unicode characters that are part of the official character encoding system. They're completely safe and won't harm your device or account. However, use them appropriately and avoid excessive styling that might reduce readability.",
    },
    {
      question: "Do I need to install anything?",
      answer:
        "No installation required! This is a web-based tool that works directly in your browser. Simply type your text, copy the style you like, and paste it wherever you want to use it. The Unicode characters are supported natively by most systems.",
    },
    {
      question: "How can Rybbit help me track my social media performance?",
      answer: (
        <>
          Rybbit helps you track clicks, engagement, and traffic sources from
          your {platform.name} posts and bio links. See which content drives the
          most engagement and optimize your social media strategy.{" "}
          <a
            href="https://rybbit.com"
            className="text-emerald-600 hover:text-emerald-500 underline"
          >
            Start tracking for free
          </a>
          .
        </>
      ),
    },
  ];

  return (
    <ToolPageLayout
      toolSlug={`${platform.id}-font-generator`}
      title={platform.displayName}
      description={platform.description}
      badge="Free Tool"
      toolComponent={
        <FontGeneratorTool
          platformName={platform.name}
          characterLimit={platform.characterLimit}
        />
      }
      educationalContent={educationalContent}
      faqs={fontFaqs}
      relatedToolsCategory="social-media"
      ctaTitle="Track your social media engagement with Rybbit"
      ctaDescription="Monitor clicks, traffic sources, and content performance across all your social platforms."
      ctaEventLocation={`${platform.id}_font_generator_cta`}
      structuredData={structuredData}
    />
  );
}

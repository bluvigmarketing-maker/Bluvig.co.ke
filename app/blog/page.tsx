import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";

import { AnimatedSection } from "@/components/site/animated-section";
import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "SEO, digital marketing, and AI visibility insights for Kenyan businesses.",
};

// Placeholder listing carried over from the current WordPress blog.
// Full post content migrates in Phase 5 of MILESTONES.md.
const POSTS = [
  {
    title: "Who Are the Best Website Developers in Kenya?",
    category: "Website Development",
  },
  {
    title:
      "The Compliance Dividend: Why NSSF Integrity Is the Secret to a Powerful Kenyan Brand",
    category: "Marketing",
  },
  {
    title: "What Is the 3-3-3 Rule in Marketing? A Strategy for Radical Focus",
    category: "Marketing",
  },
  {
    title: "Digital Marketing in Kenya (2026 Guide)",
    category: "Marketing",
  },
  {
    title: "Should I Focus on SEO, Social Media, or Ads?",
    category: "SEO",
  },
  {
    title:
      "What Questions Should I Ask Before Hiring a Digital Marketing Agency?",
    category: "Marketing",
  },
  {
    title:
      "What Digital Marketing Services Are Essential for E-Commerce Businesses?",
    category: "Marketing",
  },
  {
    title: "What Should I Look for When Choosing a Digital Marketing Agency?",
    category: "Marketing",
  },
  {
    title: "How Do I Get Clients Online? A Practical Guide to Digital Marketing",
    category: "Marketing",
  },
  {
    title:
      "How to Start Digital Marketing: A Beginner's Guide With Real-World Insights",
    category: "AI Marketing",
  },
];

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Visibility, SEO & Growth Insights"
        description="Practical writing on SEO, AI visibility, and digital marketing for Kenyan businesses."
      />
      <section className="bg-white py-20">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((post, index) => (
              <AnimatedSection key={post.title} delay={index * 0.03}>
                <article className="flex h-full flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gold-700">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {post.category}
                  </span>
                  <h2 className="font-heading text-lg leading-snug font-semibold text-navy-950">
                    {post.title}
                  </h2>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

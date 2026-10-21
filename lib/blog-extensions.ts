import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";

/**
 * The Tiptap schema for blog posts. Shared by the cockpit editor and the
 * server, which renders the saved JSON to HTML with these same extensions,
 * so the public page only ever prints markup this schema allows.
 */
export const BLOG_EXTENSIONS = [
  StarterKit.configure({
    // The post title is the page's H1.
    heading: { levels: [2, 3] },
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      // No nofollow: internal links should pass authority.
      HTMLAttributes: { rel: "noopener", target: null },
    },
  }),
  Image,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];

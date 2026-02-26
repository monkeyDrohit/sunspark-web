import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, HelpCircle, Image as ImageIcon, Layout } from "lucide-react";

export default function CMSPage() {
  const sections = [
    {
      title: "Pages",
      description: "Manage static pages like About Us, Privacy Policy, etc.",
      href: "/cms/pages",
      icon: FileText,
      color: "text-blue-500",
    },
    {
      title: "FAQ",
      description: "Manage frequently asked questions and answers.",
      href: "/cms/faq",
      icon: HelpCircle,
      color: "text-purple-500",
    },
    {
      title: "Banners",
      description: "Manage homepage banners and promotional images.",
      href: "/cms/banners",
      icon: ImageIcon,
      color: "text-green-500",
    },
    {
      title: "Top Banners",
      description: "Manage announcement banners at the top of the site.",
      href: "/cms/top-banners",
      icon: Layout,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Content Management</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your website content, pages, and promotional material.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href} className="transition-transform hover:scale-[1.02]">
              <Card className="h-full border-muted hover:border-primary/50">
                <CardHeader>
                  <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${section.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium text-primary">Manage {section.title.toLowerCase()} &rarr;</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

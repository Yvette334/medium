import React from "react";
import { render, screen } from "@testing-library/react";
import { PostCard } from "@/components/PostCard";

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>;
});

describe("PostCard", () => {
  it("renders post title and excerpt", () => {
    render(
      <PostCard
        id="p1"
        slug="demo"
        title="Demo Title"
        excerpt="Short excerpt"
        coverImage=""
        authorName="Demo Author"
        createdAt="2024-01-01T00:00:00Z"
        tags={["nextjs"]}
        claps={5}
      />,
    );

    expect(screen.getByText("Demo Title")).toBeInTheDocument();
    expect(screen.getByText(/Short excerpt/)).toBeInTheDocument();
    expect(screen.getByText(/Demo Author/)).toBeInTheDocument();
  });
});


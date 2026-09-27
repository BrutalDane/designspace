import Link from "next/link";
export default function NotFound() {
  return (
    <main className="narrow" id="main">
      <h1 className="display">Not found</h1>
      <p>This page doesn&apos;t exist, or it belongs to someone else.</p>
      <p><Link href="/">Back to your campaigns</Link></p>
    </main>
  );
}

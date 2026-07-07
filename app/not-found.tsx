import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-black text-sc-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-sc-muted mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex px-8 py-3 bg-sc-primary text-white rounded-full font-medium hover:bg-sc-primary/80 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

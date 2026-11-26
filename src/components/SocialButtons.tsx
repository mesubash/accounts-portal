import { Button } from "@/components/ui/button";

function providerUrl(provider: string, search: string) {
  return `/api/auth/${provider}${search}`;
}

export function SocialButtons({ search }: { search: string }) {
  return (
    <div className="space-y-3">
      <Button variant="outline" className="h-11 w-full font-normal" asChild>
        <a href={providerUrl("google", search)}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c5.5 0 9.1-3.8 9.1-9.2 0-.6-.06-1.1-.15-1.6H12z"
            />
          </svg>
          Continue with Google
        </a>
      </Button>
      <Button variant="outline" className="h-11 w-full font-normal" asChild>
        <a href={providerUrl("microsoft", search)}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
            <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
            <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
            <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
          </svg>
          Continue with Microsoft
        </a>
      </Button>
    </div>
  );
}

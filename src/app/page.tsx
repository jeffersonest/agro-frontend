'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoaderPage() {

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000); 

    return () => clearTimeout(timer); 
  }, [router]);

  return (
    <main className="h-screen w-screen flex items-center justify-center">
      {/* types  b c d e */}
      <div className="leaf b"> 
          <svg className="logo" width="42px" height="27px" viewBox="0 0 42 27" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <path d="M27.2861584,12.161723 C21.878637,13.1079515 17.6922039,20.3685835 15.4747077,25.1841521 C13.3245071,4.20375459 42,0 42,0 C42,0 37.9221081,28.5085611 15.7102421,26.9373612 L27.2861584,12.161723 Z M9.68859135,25.3642259 L4.07597867,14.6643189 C3.16588397,18.4076368 6.95830724,23.2066496 9.14123129,25.5907604 C-4.2897248,21.7286768 1.04594976,3.21222934 1.04594976,3.21222934 C1.04594976,3.21222934 15.98106,12.9521138 9.68859135,25.3642259 Z" id="" fill="#00ba69"></path>
          </svg>
      </div>
    </main>
  );
}

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <section className="w-[100%] h-[100%]">{children}</section>
  );
}

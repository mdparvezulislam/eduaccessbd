
import Navbar from "@/components/Navbar";

export default function HomePagelayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" bg-black text-white ">
      {/* Sidebar Component we created earlier */}
          <Navbar />

      {/* Dynamic Page Content */}
      <main className="flex-1 lg:pl-64 w-full">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "./AdminSidebar";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </SheetTrigger>
      
      {/* - bg-[#0a0a0a]: Matches the dark sidebar background
         - border-r-gray-800: Subtle dark border
         - p-0: Removes default padding so the AdminSidebar fills the space
      */}
      <SheetContent side="left" className="flex flex-col p-0 w-72 bg-[#0a0a0a] border-r-gray-800 text-white">
        
        {/* Accessibility Requirements for Radix UI */}
        <VisuallyHidden.Root>
          <SheetTitle>Admin Navigation</SheetTitle>
          <SheetDescription>Mobile navigation menu</SheetDescription>
        </VisuallyHidden.Root>

        {/* Wrapper div to handle closing the sheet when a link is clicked 
           inside the AdminSidebar
        */}
        <div className="h-full w-full" onClick={() => setOpen(false)}> 
            <AdminSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}
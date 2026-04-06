import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Copy, Check, Download } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";

const QRCheckIn = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const checkInUrl = `${window.location.origin}/visitor-form`;

  const handleCopy = () => {
    navigator.clipboard.writeText(checkInUrl);
    setCopied(true);
    toast({ title: "Link Copied!", description: "Visitor form URL copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = "visitor-checkin-qr.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <QrCode size={16} />
            QR Code Check-In
          </div>
          <h1 className="text-3xl font-bold">Visitor Self-Registration</h1>
          <p className="text-muted-foreground">
            Display this QR code at the entrance. Visitors scan it to fill in their details.
          </p>
        </div>

        <Card className="glass border-white/10 p-8 flex flex-col items-center gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <QRCodeSVG
              id="qr-code-svg"
              value={checkInUrl}
              size={240}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#1a1a2e"
            />
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Scan to open visitor form</p>
            <code className="text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 block max-w-full truncate">
              {checkInUrl}
            </code>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button className="gap-2" onClick={handleDownload}>
              <Download size={16} />
              Download QR
            </Button>
          </div>
        </Card>

        <Card className="glass border-white/10 p-6 space-y-4">
          <h2 className="font-semibold text-lg">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Scan QR", desc: "Visitor scans the code at the entrance gate" },
              { step: "2", title: "Fill Details", desc: "They enter name, phone, and purpose of visit" },
              { step: "3", title: "Admin Approves", desc: "Admin reviews and approves or rejects the request" },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-2 p-4 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mx-auto text-lg">
                  {item.step}
                </div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default QRCheckIn;

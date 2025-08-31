// 'use client';

// import { useState } from 'react';
// import { Download, Loader2, Moon, Sun, Wand2 } from 'lucide-react';
// import { useTheme } from 'next-themes';
// import { processImage, type EnhancementResult } from '@/app/actions';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { useToast } from '@/hooks/use-toast';
// import { HistorySidebar } from './history-sidebar';
// import { ImageUploader } from './image-uploader';
// import { ImageResultDisplay } from './image-result-display';
// import { SidebarInset } from './ui/sidebar';
// import Image from 'next/image';

// type Status = 'idle' | 'preview' | 'loading' | 'success' | 'error';

// function ThemeToggle() {
//   const { theme, setTheme } = useTheme();

//   return (
//     <Button
//       variant="ghost"
//       size="icon"
//       onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
//     >
//       <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
//       <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
//       <span className="sr-only">Toggle theme</span>
//     </Button>
//   );
// }

// export default function ImageEnhancerPage() {
//   const [status, setStatus] = useState<Status>('idle');
//   const [history, setHistory] = useState<EnhancementResult[]>([]);
//   const [currentResult, setCurrentResult] = useState<EnhancementResult | null>(null);
//   const [originalImage, setOriginalImage] = useState<string | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);


//   const { toast } = useToast();

//   const handleImageUpload = (file: File) => {
//     setImageFile(file);
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => {
//       setOriginalImage(reader.result as string);
//       setStatus('preview');
//       setCurrentResult(null);
//     };
//     reader.onerror = () => {
//       setStatus('error');
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to read the image file.',
//       });
//     };
//   };

//   const handleProcessImage = async () => {
//     if (!originalImage) return;

//     setStatus('loading');

//     try {
//       const enhancementResult = await processImage(originalImage);
//       // Assign a unique ID if filename is not unique enough, for now assuming it is
//       const resultWithId = { ...enhancementResult, id: enhancementResult.filename }; 
      
//       setHistory(prev => [resultWithId, ...prev.filter(item => item.filename !== resultWithId.filename)]);
//       setCurrentResult(resultWithId);
//       setStatus('success');
//     } catch (error) {
//       setStatus('error');
//       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
//       toast({
//         variant: 'destructive',
//         title: 'Processing Failed',
//         description: errorMessage,
//       });
//     }
//   };

//   const handleSelectResult = (id: string | null) => {
//     if (id === null) {
//       handleNewEnhancement();
//       return;
//     }
//     const selected = history.find(item => item.filename === id);
//     if (selected) {
//       setCurrentResult(selected);
//       // We don't have the original image for historical items, so we can't display it side-by-side
//       // This is a limitation for now. A better approach would be to store original images too.
//       // For this implementation, we will fetch it again (this is inefficient and just for demo)
//       // A better way would be to store it or decide not to show original for history items.
//       setOriginalImage(null); // Or find a way to retrieve it
//       setImageFile(null);
//       setStatus('success');
//     }
//   };
  
//   const handleNewEnhancement = () => {
//      setCurrentResult(null);
//      setOriginalImage(null);
//      setImageFile(null);
//      setStatus('idle');
//   }

//   const handleDownload = () => {
//     if (!currentResult?.enhanced_image_base64) return;
//     const link = document.createElement('a');
//     link.href = currentResult.enhanced_image_base64;
//     link.download = `enhanced-${currentResult.filename}`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="flex min-h-dvh w-full">
//       <HistorySidebar
//         history={history}
//         currentResultId={currentResult?.filename ?? null}
//         onSelectResult={handleSelectResult}
//         onNewEnhancement={handleNewEnhancement}
//         isLoading={status === 'loading'}
//       />
//       <SidebarInset>
//         <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-end border-b bg-background/80 px-4 backdrop-blur-xl md:px-6">
//           <div className="flex items-center gap-2">
//             <ThemeToggle />
//           </div>
//         </header>

//         <main className="flex-1 p-4 md:p-8">
//           {status === 'idle' && (
//             <div className="mx-auto max-w-4xl pt-8">
//               <Card className="shadow-lg animate-in fade-in duration-500">
//                 <CardHeader className="text-center">
//                   <CardTitle className="text-3xl font-black">
//                     Enhance Your Images with a Single Click
//                   </CardTitle>
//                   <CardDescription className="text-lg">
//                     Upload an image to assess its quality, enhance it with AI, and
//                     see the stunning improvement.
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <ImageUploader onImageSelect={handleImageUpload} />
//                 </CardContent>
//               </Card>
//             </div>
//           )}

//           {status === 'preview' && originalImage && (
//              <div className="mx-auto max-w-4xl pt-8 animate-in fade-in duration-500">
//                <Card className="shadow-lg">
//                   <CardHeader className="text-center">
//                     <CardTitle className="text-3xl font-black">Image Preview</CardTitle>
//                     <CardDescription>
//                       Ready to boost this image? Click the button below to start the AI enhancement.
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-6">
//                     <div className="relative mx-auto aspect-video max-h-[50vh] w-full max-w-2xl overflow-hidden rounded-lg border">
//                        <Image src={originalImage} alt="Image Preview" fill className="object-contain" />
//                     </div>
//                     <div className="text-center">
//                         <Button size="lg" onClick={handleProcessImage}>
//                             <Wand2 className="mr-2" />
//                             Enhance Image
//                         </Button>
//                     </div>
//                   </CardContent>
//                </Card>
//              </div>
//           )}
          
//           {status === 'loading' && (
//             <div className="flex flex-col items-center justify-center gap-4 rounded-lg p-8 text-center h-[60vh]">
//                 <Loader2 className="h-16 w-16 animate-spin text-primary" />
//                 <p className="font-semibold text-2xl">Processing your image...</p>
//                 <p className="text-muted-foreground max-w-md">
//                   AI is working its magic. This may take a moment. Please wait.
//                 </p>
//             </div>
//           )}

//           {status === 'error' && (
//             <div className="mx-auto max-w-2xl pt-8">
//                 <Card className="border-destructive/50 bg-destructive/10 text-center">
//                   <CardHeader>
//                     <CardTitle className="text-destructive">Enhancement Failed</CardTitle>
//                     <CardDescription className="text-destructive/90">
//                       Something went wrong while processing your image.
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                       <Button onClick={handleNewEnhancement} variant="destructive">
//                         Try Again
//                       </Button>
//                   </CardContent>
//                 </Card>
//             </div>
//           )}

//           {status === 'success' && currentResult && (
//             <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
//               {/* For now, originalImage might be null for history items. We handle this in ImageResultDisplay */}
//               <ImageResultDisplay originalImage={originalImage} result={currentResult} />
//               <div className="mt-6 flex justify-center gap-4">
//                   <Button size="lg" onClick={handleDownload}>
//                       <Download className="mr-2" />
//                       Download Enhanced Image
//                   </Button>
//                   <Button size="lg" variant="outline" onClick={handleNewEnhancement}>
//                       Enhance Another
//                   </Button>
//               </div>
//             </div>
//           )}
//         </main>
//       </SidebarInset>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { Download, Loader2, Moon, Sun, Wand2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { processImage, type EnhancementResult } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { HistorySidebar } from './history-sidebar';
import { ImageUploader } from './image-uploader';
import { ImageResultDisplay } from './image-result-display';
import { SidebarInset } from './ui/sidebar';
import Image from 'next/image';

type Status = 'idle' | 'preview' | 'loading' | 'success' | 'error';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default function ImageEnhancerPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [history, setHistory] = useState<EnhancementResult[]>([]);
  const [currentResult, setCurrentResult] = useState<EnhancementResult | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);


  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setStatus('preview');
      setCurrentResult(null);
    };
    reader.onerror = () => {
      setStatus('error');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to read the image file.',
      });
    };
  };

  const handleProcessImage = async () => {
    if (!originalImage || !imageFile) return;

    setStatus('loading');

    try {
      const enhancementResult = await processImage(originalImage);
      const resultWithFilename = { ...enhancementResult, filename: imageFile.name };
      
      setHistory(prev => [resultWithFilename, ...prev.filter(item => item.filename !== resultWithFilename.filename)]);
      setCurrentResult(resultWithFilename);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Processing Failed',
        description: errorMessage,
      });
    }
  };

  const handleSelectResult = (id: string | null) => {
    if (id === null) {
      handleNewEnhancement();
      return;
    }
    const selected = history.find(item => item.filename === id);
    if (selected) {
      setCurrentResult(selected);
      // We don't have the original image for historical items, so we can't display it side-by-side
      // This is a limitation for now. A better approach would be to store original images too.
      // For this implementation, we will fetch it again (this is inefficient and just for demo)
      // A better way would be to store it or decide not to show original for history items.
      setOriginalImage(null); // Or find a way to retrieve it
      setImageFile(null);
      setStatus('success');
    }
  };
  
  const handleNewEnhancement = () => {
     setCurrentResult(null);
     setOriginalImage(null);
     setImageFile(null);
     setStatus('idle');
  }

  const handleDownload = () => {
    if (!currentResult?.enhanced_image_base64) return;
    const link = document.createElement('a');
    link.href = currentResult.enhanced_image_base64;
    link.download = `enhanced-${currentResult.filename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-dvh w-full">
      <HistorySidebar
        history={history}
        currentResultId={currentResult?.filename ?? null}
        onSelectResult={handleSelectResult}
        onNewEnhancement={handleNewEnhancement}
        isLoading={status === 'loading'}
      />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-end border-b bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {status === 'idle' && (
            <div className="mx-auto max-w-4xl pt-8">
              <Card className="shadow-lg animate-in fade-in duration-500">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-black">
                    Enhance Your Images with a Single Click
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Upload an image to assess its quality, enhance it with AI, and
                    see the stunning improvement.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader onImageSelect={handleImageUpload} />
                </CardContent>
              </Card>
            </div>
          )}

          {status === 'preview' && originalImage && (
             <div className="mx-auto max-w-4xl pt-8 animate-in fade-in duration-500">
               <Card className="shadow-lg">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-black">Image Preview</CardTitle>
                    <CardDescription>
                      Ready to boost this image? Click the button below to start the AI enhancement.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="relative mx-auto aspect-video max-h-[50vh] w-full max-w-2xl overflow-hidden rounded-lg border">
                       <Image src={originalImage} alt="Image Preview" fill className="object-contain" />
                    </div>
                    <div className="text-center">
                        <Button size="lg" onClick={handleProcessImage}>
                            <Wand2 className="mr-2" />
                            Enhance Image
                        </Button>
                    </div>
                  </CardContent>
               </Card>
             </div>
          )}
          
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg p-8 text-center h-[60vh]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="font-semibold text-2xl">Processing your image...</p>
                <p className="text-muted-foreground max-w-md">
                  AI is working its magic. This may take a moment. Please wait.
                </p>
            </div>
          )}

          {status === 'error' && (
            <div className="mx-auto max-w-2xl pt-8">
                <Card className="border-destructive/50 bg-destructive/10 text-center">
                  <CardHeader>
                    <CardTitle className="text-destructive">Enhancement Failed</CardTitle>
                    <CardDescription className="text-destructive/90">
                      Something went wrong while processing your image.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button onClick={handleNewEnhancement} variant="destructive">
                        Try Again
                      </Button>
                  </CardContent>
                </Card>
            </div>
          )}

          {status === 'success' && currentResult && (
            <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
              {/* For now, originalImage might be null for history items. We handle this in ImageResultDisplay */}
              <ImageResultDisplay originalImage={originalImage} result={currentResult} />
              <div className="mt-6 flex justify-center gap-4">
                  <Button size="lg" onClick={handleDownload}>
                      <Download className="mr-2" />
                      Download Enhanced Image
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleNewEnhancement}>
                      Enhance Another
                  </Button>
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </div>
  );
}

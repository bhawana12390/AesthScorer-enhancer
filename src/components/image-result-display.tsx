// 'use client';

// import Image from 'next/image';
// import type { EnhancementResult } from '@/app/actions';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { ScoreDisplay } from './score-display';
// import { Separator } from './ui/separator';
// import { Wand2, ImageIcon } from 'lucide-react';
// import { Badge } from './ui/badge';

// interface ImageResultDisplayProps {
//   originalImage: string | null; // Can be null for history items
//   result: EnhancementResult;
// }

// function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
//     return (
//         <div className="flex justify-between items-center text-sm">
//             <p className="text-muted-foreground">{label}</p>
//             <p className="font-medium">{value}</p>
//         </div>
//     )
// }

// export function ImageResultDisplay({ originalImage, result }: ImageResultDisplayProps) {
//     const { original_rating, enhanced_rating, enhancement_info, improvement_analysis } = result;
//     const scoreImprovement = improvement_analysis.percentage_improvement;
    
//   return (
//     <Card className="overflow-hidden">
//         <div className="grid grid-cols-1 lg:grid-cols-2">
//             <div className="relative aspect-video bg-muted/30 flex items-center justify-center">
//                 {originalImage ? (
//                     <>
//                         <Image src={originalImage} alt="Original Image" fill style={{ objectFit: 'contain' }} />
//                         <Badge variant="secondary" className="absolute top-2 left-2">Original</Badge>
//                     </>
//                 ) : (
//                     <div className="flex flex-col items-center gap-2 text-muted-foreground">
//                         <ImageIcon className="w-16 h-16" />
//                         <p>Original image not available in history.</p>
//                     </div>
//                 )}
//             </div>
//             <div className="relative aspect-video bg-muted/30">
//                  <Image src={result.enhanced_image_base64} alt="Enhanced Image" fill style={{ objectFit: 'contain' }} />
//                  <Badge className="absolute top-2 left-2">Enhanced</Badge>
//             </div>
//         </div>
//         <Separator />
//         <div className="grid grid-cols-1 md:grid-cols-3">
//            <div className="p-6 flex flex-col items-center justify-center space-y-4">
//               <ScoreDisplay score={original_rating.quality_score} label="Initial Quality" />
//               <div className="w-full space-y-2 text-sm">
//                 <InfoItem label="Dimensions" value={`${original_rating.image_info.width} x ${original_rating.image_info.height}`} />
//                 <InfoItem label="Format" value={original_rating.image_info.format} />
//                 <InfoItem label="Processing Time" value={`${original_rating.processing_time.toFixed(2)}s`} />
//               </div>
//            </div>
//            <div className="p-6 flex flex-col items-center justify-center space-y-4 border-x">
//              <div className="flex flex-col items-center text-center">
//                 <Wand2 className="w-10 h-10 text-primary mb-2" />
//                 <h3 className="text-lg font-semibold">Enhancement Details</h3>
//              </div>
//              <div className="w-full space-y-2 text-sm">
//                 <InfoItem label="Scale Factor" value={`x${enhancement_info.scale_factor}`} />
//                 <InfoItem label="Size Increase" value={`${enhancement_info.size_increase}x`} />
//                 <InfoItem label="Processing Time" value={`${enhancement_info.processing_time.toFixed(2)}s`} />
//              </div>
//               {scoreImprovement > 0 && (
//                 <div className="text-center pt-4">
//                     <p className="text-4xl font-bold text-accent">+{scoreImprovement.toFixed(0)}%</p>
//                     <p className="text-sm font-semibold text-muted-foreground">Quality Improvement</p>
//                 </div>
//               )}
//            </div>
//            <div className="p-6 flex flex-col items-center justify-center space-y-4">
//                <ScoreDisplay score={enhanced_rating.quality_score} label="Enhanced Quality" />
//                 <div className="w-full space-y-2 text-sm">
//                     <InfoItem label="Dimensions" value={`${enhancement_info.enhanced_size[0]} x ${enhancement_info.enhanced_size[1]}`} />
//                     <InfoItem label="Format" value={original_rating.image_info.format} />
//                     <InfoItem label="Processing Time" value={`${enhanced_rating.processing_time.toFixed(2)}s`} />
//                 </div>
//            </div>
//         </div>
//     </Card>
//   );
// }

'use client';

import Image from 'next/image';
import type { EnhancementResult } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreDisplay } from './score-display';
import { Separator } from './ui/separator';
import { Wand2, ImageIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from './ui/badge';

interface ImageResultDisplayProps {
  originalImage: string | null; // Can be null for history items
  result: EnhancementResult;
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    )
}

function ImprovementAnalysis({ percentage }: { percentage: number }) {
    const isImproved = percentage > 0;
    const isSame = percentage === 0;

    let colorClass = 'text-accent';
    let Icon = TrendingUp;
    if (!isImproved && !isSame) {
        colorClass = 'text-destructive';
        Icon = TrendingDown;
    } else if (isSame) {
        colorClass = 'text-muted-foreground';
        Icon = Minus;
    }

    return (
      <div className="text-center">
        <div className={`flex items-center justify-center gap-2 text-4xl font-bold ${colorClass}`}>
          <Icon className="w-8 h-8" />
          <span>
            {isImproved ? '+' : ''}
            {percentage.toFixed(0)}%
          </span>
        </div>
        <p className="text-sm font-semibold text-muted-foreground">Quality Improvement</p>
      </div>
    );
}

export function ImageResultDisplay({ originalImage, result }: ImageResultDisplayProps) {
    const { original_rating, enhanced_rating, enhancement_info, improvement_analysis } = result;
    const scoreImprovement = improvement_analysis.percentage_improvement;
    
  return (
    <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative aspect-video bg-muted/30 flex items-center justify-center">
                {originalImage ? (
                    <>
                        <Image src={originalImage} alt="Original Image" fill style={{ objectFit: 'contain' }} />
                        <Badge variant="secondary" className="absolute top-2 left-2">Original</Badge>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageIcon className="w-16 h-16" />
                        <p>Original image not available.</p>
                    </div>
                )}
            </div>
            <div className="relative aspect-video bg-muted/30">
                 <Image src={result.enhanced_image_base64} alt="Enhanced Image" fill style={{ objectFit: 'contain' }} />
                 <Badge className="absolute top-2 left-2">Enhanced</Badge>
            </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-3">
           <div className="p-6 flex flex-col items-center justify-center space-y-4">
              <ScoreDisplay score={original_rating.quality_score} label="Initial Quality" />
              <div className="w-full space-y-2 text-sm">
                <InfoItem label="Dimensions" value={`${original_rating.image_info.width} x ${original_rating.image_info.height}`} />
                <InfoItem label="Format" value={original_rating.image_info.format} />
                <InfoItem label="Processing Time" value={`${original_rating.processing_time.toFixed(2)}s`} />
              </div>
           </div>
           <div className="p-6 flex flex-col items-center justify-center space-y-4 border-x bg-muted/30">
             <div className="flex flex-col items-center text-center">
                <Wand2 className="w-10 h-10 text-primary mb-2" />
                <h3 className="text-lg font-semibold">Enhancement Analysis</h3>
             </div>

             <ImprovementAnalysis percentage={scoreImprovement} />

             <div className="w-full space-y-2 text-sm pt-4">
                <InfoItem label="Scale Factor" value={`x${enhancement_info.scale_factor}`} />
                <InfoItem label="New Dimensions" value={`${enhancement_info.enhanced_size[0]} x ${enhancement_info.enhanced_size[1]}`} />
                <InfoItem label="AI Processing Time" value={`${enhancement_info.processing_time.toFixed(2)}s`} />
             </div>
           </div>
           <div className="p-6 flex flex-col items-center justify-center space-y-4">
               <ScoreDisplay score={enhanced_rating.quality_score} label="Enhanced Quality" />
                <div className="w-full space-y-2 text-sm">
                    <InfoItem label="Dimensions" value={`${enhancement_info.enhanced_size[0]} x ${enhancement_info.enhanced_size[1]}`} />
                    <InfoItem label="Format" value={original_rating.image_info.format} />
                    <InfoItem label="Rating Time" value={`${enhanced_rating.processing_time.toFixed(2)}s`} />
                </div>
           </div>
        </div>
    </Card>
  );
}

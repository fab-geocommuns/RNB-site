import ImageNext from 'next/image';
import pivotIllu from '@/public/images/pivot-sentence.png';
import pivotIlluMobile from '@/public/images/pivot-sentence-mobile.png';

export default function PivotIllustration() {
  return (
    <>
      <div className="none md-block">
        <ImageNext
          className="resp-image"
          src={pivotIllu}
          alt="Illustration d’un pivot"
        />
      </div>
      <div className="md-none">
        <ImageNext
          className="resp-image"
          src={pivotIlluMobile}
          alt="Illustration d’un pivot"
        />
      </div>
    </>
  );
}

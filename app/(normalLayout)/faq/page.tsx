import path from 'path';
import { promises as fs } from 'fs';

import { parse } from 'yaml'

// Components
import SectionList from '@/components/faq/SectionsList'
import Summary from '@/components/faq/Summary'
import BackToTop from '@/components/BackToTop';
import AboutCol from "@/components/AboutCol"

async function fetchFaqSections() {

    // Read json file in the data folder
    const jsonDirectory = path.join(process.cwd(), 'data');
    //Read the json data file data.json
    const fileContents = await fs.readFile(jsonDirectory + '/faq.yaml', 'utf8');
    //Return the content of the data file in json format
    const data = parse(fileContents);

    return data

}

export default async function Page() {


    const sections = await fetchFaqSections();
    
    
    return (
        <>

            <BackToTop />
            <div className="fr-container">

            <div className="fr-grid-row fr-grid-row--gutters fr-py-12v">
                        <div className="fr-col-12 fr-col-md-8">

                            <h1>Foire aux questions</h1>


                            <Summary sections={sections} />
                            <hr className='fr-my-16v' />
                            <SectionList sections={sections} />

                </div>  
                <div className="fr-col-12 fr-col-md-3 fr-col-offset-md-1">
                <div>

<AboutCol />

 

</div>
                </div>

            </div>
                
            </div>
        </>
    )
}


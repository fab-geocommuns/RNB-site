import Link from "next/link"

// Style
import styles from '@/styles/faq.module.scss'

import path from 'path';
import { promises as fs } from 'fs';

import { parse } from 'yaml'

// Components
import SectionList from '@/components/faq/SectionsList'
import Summary from '@/components/faq/Summary'

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
            <div className="fr-container">

                <div className="fr-grid-row">
                        <div className="fr-col-12 fr-py-12v">

                            <h1>Foire aux Questions</h1>

                            <Summary sections={sections} />
                           <SectionList sections={sections} />

                </div>                            
            </div>
                
            </div>
        </>
    )
}


import { cache } from 'react'

export const getSummerGamesData = cache(async () => {

    const url = process.env.NEXT_PUBLIC_API_BASE + '/contributions/ranking/'

    const response = await fetch(url, {cache: 'no-cache', headers: {'Content-Type': 'application/json'}})
    const ranks = await response.json()



    let formatted = {
        'individual': [],
        'department': [],
        'city': [],
        'shared': {
            'goal': 1000,
            'absolute': 0,
            'percent': 0
        }
    }

    // individual
    formatted.individual = ranks.individual.map((rank: any) => {
        return {
            'name': '#' + rank[1],
            'count': rank[0]
        }
    });

    // city
    formatted.city = ranks.city.map((rank: any) => {
        return {
            'name': rank[1] + ' (' + rank[0].slice(0,2) + ')',
            'count': rank[2]
        }
    })

    // department
    formatted.department = ranks.departement.map((rank: any) => {
        return {
            'name': rank[1] + ' (' + rank[0] + ')',
            'count': rank[2]
        }
    })

    

    // global
    formatted.shared['absolute'] = ranks.global;
    formatted.shared.percent = Math.round(ranks.global / formatted.shared.goal * 100)

    return formatted;

})
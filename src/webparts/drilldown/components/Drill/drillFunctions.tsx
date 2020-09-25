import { Web, IList, IItem } from "@pnp/sp/presets/all";

import { sp } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/clientside-pages/web";
import { ClientsideWebpart } from "@pnp/sp/clientside-pages";
import { CreateClientsidePage, PromotedState, ClientsidePageLayoutType, ClientsideText,  } from "@pnp/sp/clientside-pages";

import { IContentsListInfo, IMyListInfo, IServiceLog, IContentsLists } from '../../../../services/listServices/listTypes'; //Import view arrays for Time list

import { IDrillItemInfo, IDrillList, pivCats } from  './drillComponent';

import { changes, IMyFieldTypes } from '../../../../services/listServices/columnTypes'; //Import view arrays for Time list

import { IMyView,  } from '../../../../services/listServices/viewTypes'; //Import view arrays for Time list

import { addTheseItemsToList, addTheseItemsToListInBatch } from '../../../../services/listServices/listServices';

import { makeSmallTimeObject, makeTheTimeObject,ITheTime, getAge, getBestTimeDelta, isStringValidDate, monthStr3} from '../../../../services/dateServices';

import { doesObjectExistInArray, addItemToArrayIfItDoesNotExist, sortKeysByOtherKey } from '../../../../services/arrayServices';

import { getHelpfullError } from '../../../../services/ErrorHandler';

import { IViewLog, addTheseViews } from '../../../../services/listServices/viewServices'; //Import view arrays for Time list

import { IAnyArray } from  '../../../../services/listServices/listServices';

import { getDetailValueType, ITypeStrings } from '../../../../services/typeServices';

import { mergeAriaAttributeValues } from "office-ui-fabric-react";

import { IRefiners, IRefinerLayer, IItemRefiners, RefineRuleValues, RefinerStatTypes, RefinerChartTypes, IRefinerStats, IRefinerStatType } from '../IReUsableInterfaces';

import { IRefinerStat } from '../../components/IReUsableInterfaces';

//   d888b  d88888b d888888b  .d8b.  db      db      d888888b d888888b d88888b .88b  d88. .d8888. 
//  88' Y8b 88'     `~~88~~' d8' `8b 88      88        `88'   `~~88~~' 88'     88'YbdP`88 88'  YP 
//  88      88ooooo    88    88ooo88 88      88         88       88    88ooooo 88  88  88 `8bo.   
//  88  ooo 88~~~~~    88    88~~~88 88      88         88       88    88~~~~~ 88  88  88   `Y8b. 
//  88. ~8~ 88.        88    88   88 88booo. 88booo.   .88.      88    88.     88  88  88 db   8D 
//   Y888P  Y88888P    YP    YP   YP Y88888P Y88888P Y888888P    YP    Y88888P YP  YP  YP `8888Y' 
//                                                                                                
//        


export async function getAllItems( drillList: IDrillList, addTheseItemsToState: any, setProgress: any, markComplete: any ): Promise<IDrillItemInfo[]>{

    let allRefiners : IRefinerLayer = null;

    //lists.getById(listGUID).webs.orderBy("Title", true).get().then(function(result) {
    //let allItems : IDrillItemInfo[] = await sp.web.webs.get();

    let thisListObject = null;

    let allItems : IDrillItemInfo[] = [];
    let errMessage = '';
    try {
        thisListObject = Web(drillList.webURL);
        allItems = await thisListObject.lists.getByTitle(drillList.name).items.orderBy('ID',false).top(300).get();
    
    } catch (e) {
        errMessage = getHelpfullError(e, true, true);

    }

    let thisIsNow = new Date().toLocaleString();

    for (let i in allItems ) {

        allItems[i].timeCreated = makeTheTimeObject(allItems[i].Created);
        allItems[i].timeModified = makeTheTimeObject(allItems[i].Modified);

        allItems[i].bestCreate = getBestTimeDelta(allItems[i].Created, thisIsNow);
        allItems[i].bestMod = getBestTimeDelta(allItems[i].Modified, thisIsNow);

        allItems[i].refiners = getItemRefiners( drillList, allItems[i] );

        allItems[i].meta = buildMetaFromItem(allItems[i]);
        allItems[i].searchString = buildSearchStringFromItem(allItems[i]);

    }

    if ( errMessage === '' && allItems.length === 0 ) { 
        errMessage = 'This site/web does not have any subsites that you can see.';
     }
    
    console.log('drillList.refiners =', drillList.refiners );
    //for ( let i = 0 ; i < 5000 ; i++ ) {
        allRefiners = buildRefinersObject( allItems, drillList );
        //console.log(i);
    //}

    console.log('Pre-Sort: getAllItems', allRefiners);

    allRefiners = sortRefinerObject(allRefiners, drillList);

    console.log('Post-Sort: getAllItems', allRefiners);

    addTheseItemsToState(drillList, allItems, errMessage, allRefiners );
    return allItems;

}

//    88.    .d88b.  d8888b. d888888b      d8888b. d88888b d88888b d888888b d8b   db d88888b d8888b. 
//  88'  YP .8P  Y8. 88  `8D `~~88~~'      88  `8D 88'     88'       `88'   888o  88 88'     88  `8D 
//  `8bo.   88    88 88oobY'    88         88oobY' 88ooooo 88ooo      88    88V8o 88 88ooooo 88oobY' 
//    `Y8b. 88    88 88`8b      88         88`8b   88~~~~~ 88~~~      88    88 V8o88 88~~~~~ 88`8b   
//  db   8D `8b  d8' 88 `88.    88         88 `88. 88.     88        .88.   88  V888 88.     88 `88. 
//  `8888Y'  `Y88P'  88   YD    YP         88   YD Y88888P YP      Y888888P VP   V8P Y88888P 88   YD 
//                                                                                                   
//    

function sortRefinerObject ( allRefiners: IRefinerLayer, drillList: IDrillList ) {

    //webPartDefs.sort((a, b) => (a.alias > b.alias) ? 1 : -1);

//    allRefiners.childrenKeys.sort(); //Removed when using sortKeysByOtherKey
    allRefiners.childrenObjs.sort((a, b) => (a.thisKey > b.thisKey) ? 1 : -1);
    let statsToSort : string[] = ['childrenCounts','childrenMultiCounts'];
    for ( let i in drillList.refinerStats ) {
        statsToSort.push('stat' + i);
        statsToSort.push('stat' + i + 'Count');
    }
    allRefiners = sortKeysByOtherKey ( allRefiners, 'childrenKeys', 'asc', 'string', statsToSort);
    allRefiners.childrenObjs = sortRefinerLayer( allRefiners.childrenObjs, drillList );

    return allRefiners;

}

function sortRefinerLayer ( allRefiners: IRefinerLayer[], drillList: IDrillList ) {

    for ( let r in allRefiners ) { //Go through all list items
        //allRefiners[r].childrenKeys.sort();
        allRefiners[r].childrenObjs.sort((a, b) => (a.thisKey > b.thisKey) ? 1 : -1);
        let statsToSort : string[] = [];
        for ( let i in drillList.refinerStats ) {
            statsToSort.push('stat' + i);
            statsToSort.push('stat' + i + 'Count');
        }
        allRefiners[r] = sortKeysByOtherKey ( allRefiners[r], 'childrenKeys', 'asc', 'string', statsToSort);
        allRefiners[r].childrenObjs = sortRefinerLayer( allRefiners[r].childrenObjs, drillList );
    }

    return allRefiners;
}

//  d8888b. db    db d888888b db      d8888b.      d8888b. d88888b d88888b d888888b d8b   db d88888b d8888b. 
//  88  `8D 88    88   `88'   88      88  `8D      88  `8D 88'     88'       `88'   888o  88 88'     88  `8D 
//  88oooY' 88    88    88    88      88   88      88oobY' 88ooooo 88ooo      88    88V8o 88 88ooooo 88oobY' 
//  88~~~b. 88    88    88    88      88   88      88`8b   88~~~~~ 88~~~      88    88 V8o88 88~~~~~ 88`8b   
//  88   8D 88b  d88   .88.   88booo. 88  .8D      88 `88. 88.     88        .88.   88  V888 88.     88 `88. 
//  Y8888P' ~Y8888P' Y888888P Y88888P Y8888D'      88   YD Y88888P YP      Y888888P VP   V8P Y88888P 88   YD 
//                                                                                                           
//      


function createNewRefinerLayer( thisKey: string, drillList: IDrillList ) {
    let newRefiner : IRefinerLayer = {
        multiCount: 0,
        itemCount: 0,
        thisKey: thisKey,
        childrenKeys: [],
        childrenObjs: [],
        childrenCounts: [],
        childrenMultiCounts: [],
    };

    for ( let i in drillList.refinerStats ) {
        newRefiner['stat' + i] = [];
        newRefiner['stat' + i + 'Count'] = [];
    }

    return newRefiner;
}

function buildRefinerLayerDidNotWork ( level: number, refinersParent : IRefinerLayer , i: IDrillItemInfo, drillList: IDrillList ) {

    let result: IRefinerLayer = null;

    if ( level > 2 ) {
        return refinersParent;

    } else {

        //Do just level 1
        let thisRefinerValuesLevX = i.refiners['lev' + level];
        //Go through each array of refinersParent... 
        for ( let r0 in thisRefinerValuesLevX ) { //Go through all list items

            let thisRefinerX = thisRefinerValuesLevX[r0];
            let topKeyX = refinersParent.childrenKeys.indexOf( thisRefinerX );

            if ( topKeyX < 0 ) { //Add to topKeys and create keys child object
                refinersParent.childrenKeys.push( thisRefinerX );
                refinersParent.childrenObjs.push( createNewRefinerLayer ( thisRefinerX, drillList ) );
                refinersParent.childrenCounts.push( 0 );
                refinersParent.childrenMultiCounts.push( 0 );
                topKeyX = refinersParent.childrenKeys.length -1;
                //Add empty object in array for later use
                for ( let i2 in drillList.refinerStats ) {
                    refinersParent['stat' + i2].push(null);
                    refinersParent['stat' + i2 + 'Count'].push(0);
                }
            }

            refinersParent.multiCount ++;
            refinersParent.childrenCounts[topKeyX] ++;
            refinersParent.childrenMultiCounts[topKeyX] ++;
            if ( r0 == '0') { refinersParent.itemCount ++; }

            /**
             * This loop gets the totals used for stats for each stat based on all items with that refiner.
             * By design it ignores any items of EntryType = 'start' because the entry that counts is the one that has time.
             * Maybe I should just ignore any with zero as time.
             */
            if ( i.EntryType !== 'start') {
                for ( let i2 in drillList.refinerStats ) {
                    let thisStat = drillList.refinerStats[i2].stat;
                    let thisValue = i.refiners['stat' + i2];
                    let currentRefinerValue = refinersParent['stat' + i2][topKeyX];

                    if ( thisStat === 'sum' || thisStat === 'avg' || thisStat === 'daysAgo' || thisStat === 'monthsAgo' ) {
                        //Add numbers up here and divide by total count later
                        refinersParent['stat' + i2][topKeyX] += thisValue;
                        refinersParent['stat' + i2 + 'Count'][topKeyX] ++;

                    } else if ( thisStat === 'max' ) {
                        if ( thisValue > currentRefinerValue || currentRefinerValue === null ) {
                            //Add numbers up here and divide by total count later
                            refinersParent['stat' + i2][topKeyX] = thisValue;
                            refinersParent['stat' + i2 + 'Count'][topKeyX] ++;
                        } else {
                            console.log( 'no update: ' + thisValue + ' is NOT LARGER than ' +currentRefinerValue );
                        }

                    } else if ( thisStat === 'min' ) {
                        if ( thisValue < currentRefinerValue || currentRefinerValue === null ) {
                            //Add numbers up here and divide by total count later
                            refinersParent['stat' + i2][topKeyX] = thisValue;
                            refinersParent['stat' + i2 + 'Count'][topKeyX] ++;
                        } else {
                            console.log( 'no update: ' + thisValue + ' is NOT LESS than ' +currentRefinerValue );
                        }

                    } else { console.log('Not sure what to do with this stat: ', thisStat, i.refiners ) ; }
                }
            }
            level ++;
            if ( level < 3 ) {
                result = buildRefinerLayerDidNotWork ( level, refinersParent.childrenObjs[topKeyX] , i, drillList );
            }
        }
    }

    return result;

}

export function updateThisRefiner( r0: any, topKeyZ: number,  thisRefiner0: any, refiners:IRefinerLayer, drillList: IDrillList ) {

    if ( topKeyZ < 0 ) { //Add to topKeys and create keys child object
        refiners.childrenKeys.push( thisRefiner0 );
        refiners.childrenObjs.push( createNewRefinerLayer ( thisRefiner0, drillList ) );
        refiners.childrenCounts.push( 0 );
        refiners.childrenMultiCounts.push( 0 );
        topKeyZ = refiners.childrenKeys.length -1;
        //Add empty object in array for later use
        for ( let i2 in drillList.refinerStats ) {
            refiners['stat' + i2].push(null);
            refiners['stat' + i2 + 'Count'].push(0);
        }

    }
    refiners.multiCount ++;
    refiners.childrenCounts[topKeyZ] ++;
    refiners.childrenMultiCounts[topKeyZ] ++;
    if ( r0 == '0') { refiners.itemCount ++; }

    return refiners;


}

export function buildRefinersObject ( items: IDrillItemInfo[], drillList: IDrillList ) {

    let refiners : IRefinerLayer = {
        thisKey: '',
        multiCount: 0,
        itemCount: 0,
        childrenKeys: [],
        childrenObjs: [],
        childrenCounts: [],
        childrenMultiCounts: [],
    };

    for ( let i in drillList.refinerStats ) {
        refiners['stat' + i] = [];
        refiners['stat' + i + 'Count'] = [];
    }

    drillList.refinerStats.map( s => {
    });
    //    refinerStats: IRefinerStat[];

    //Go through all items
    for ( let i of items ) { //Go through all list items
        if ( i.refiners ) { //If Item has refiners (all should)

            //Do just level 1
            let thisRefinerValuesLev0 = i.refiners['lev' + 0];
            //Go through each array of refiners... 
            for ( let r0 in thisRefinerValuesLev0 ) { //Go through all list items

                let thisRefiner0 = thisRefinerValuesLev0[r0];

                let topKey0 = refiners.childrenKeys.indexOf( thisRefiner0 );
                
                if ( topKey0 < 0 ) { //Add to topKeys and create keys child object
                    refiners.childrenKeys.push( thisRefiner0 );
                    refiners.childrenObjs.push( createNewRefinerLayer ( thisRefiner0, drillList ) );
                    refiners.childrenCounts.push( 0 );
                    refiners.childrenMultiCounts.push( 0 );
                    topKey0 = refiners.childrenKeys.length -1;
                    //Add empty object in array for later use
                    for ( let i2 in drillList.refinerStats ) {
                        refiners['stat' + i2].push(null);
                        refiners['stat' + i2 + 'Count'].push(0);
                    }

                }
                refiners.multiCount ++;
                refiners.childrenCounts[topKey0] ++;
                refiners.childrenMultiCounts[topKey0] ++;
                if ( r0 == '0') { refiners.itemCount ++; }

                /**
                 * This loop gets the totals used for stats for each stat based on all items with that refiner.
                 * By design it ignores any items of EntryType = 'start' because the entry that counts is the one that has time.
                 * Maybe I should just ignore any with zero as time.
                 */
                if ( i.EntryType !== 'start') {
                    for ( let i2 in drillList.refinerStats ) {
                        let thisStat = drillList.refinerStats[i2].stat;
                        let thisValue = i.refiners['stat' + i2];
                        let currentRefinerValue = refiners['stat' + i2][topKey0];

                        if ( thisStat === 'sum' || thisStat === 'avg' || thisStat === 'daysAgo' || thisStat === 'monthsAgo' ) {
                            //Add numbers up here and divide by total count later
                            refiners['stat' + i2][topKey0] += thisValue;
                            refiners['stat' + i2 + 'Count'][topKey0] ++;

                        } else if ( thisStat === 'max' ) {
                            if ( thisValue > currentRefinerValue || currentRefinerValue === null ) {
                                //Add numbers up here and divide by total count later
                                refiners['stat' + i2][topKey0] = thisValue;
                                refiners['stat' + i2 + 'Count'][topKey0] ++;
                            } else {
                                console.log( 'no update: ' + thisValue + ' is NOT LARGER than ' +currentRefinerValue );
                            }

                        } else if ( thisStat === 'min' ) {
                            if ( thisValue < currentRefinerValue || currentRefinerValue === null ) {
                                //Add numbers up here and divide by total count later
                                refiners['stat' + i2][topKey0] = thisValue;
                                refiners['stat' + i2 + 'Count'][topKey0] ++;
                            } else {
                                console.log( 'no update: ' + thisValue + ' is NOT LESS than ' +currentRefinerValue );
                            }


                        } else { console.log('Not sure what to do with this stat: ', thisStat, i.refiners ) ; }

                    }
                }


                //Do any stat calculations here:
                //getRefinerStatsForItem


                let thisRefinerValuesLev1 = i.refiners['lev' + 1];

                //  const found = arr1.some(r=> arr2.indexOf(r) >= 0)     https://stackoverflow.com/a/39893636  

                //Go through each array of refiners... 
                for ( let r1 in thisRefinerValuesLev1 ) { //Go through all list items
   
                    let thisRefiner1 = thisRefinerValuesLev1[r1];
                    let refiners1 = refiners.childrenObjs[topKey0];
                    let topKey1 = refiners1.childrenKeys.indexOf( thisRefiner1 );

                    if ( topKey1 < 0 ) { //Add to topKeys and create keys child object
                        refiners1.childrenKeys.push( thisRefiner1 );
                        refiners1.childrenObjs.push( createNewRefinerLayer ( thisRefiner1, drillList ) );
                        topKey1 = refiners1.childrenKeys.length -1;
                        refiners1.childrenCounts.push( 0 );
                        refiners1.childrenMultiCounts.push( 0 );
                    }
                    refiners1.multiCount ++;
                    refiners1.childrenCounts[topKey1] ++;
                    refiners1.childrenMultiCounts[topKey1] ++;
                    if ( r1 == '0') { refiners1.itemCount ++; }

                    let thisRefinerValuesLev2 = i.refiners['lev' + 2];

                    //  const found = arr1.some(r=> arr2.indexOf(r) >= 0)     https://stackoverflow.com/a/39893636  

                    //Go through each array of refiners... 
                    for ( let r2 in thisRefinerValuesLev2 ) { //Go through all list items

                        let thisRefiner2 = thisRefinerValuesLev2[r2];
                        let refiners2 = refiners1.childrenObjs[topKey1];
                        let topKey2 = refiners2.childrenKeys.indexOf( thisRefiner2 );

                        if ( topKey2 < 0 ) { //Add to topKeys and create keys child object
                            refiners2.childrenKeys.push( thisRefiner2 );
                            refiners2.childrenObjs.push( createNewRefinerLayer ( thisRefiner2, drillList ) );
                            topKey2 = refiners2.childrenKeys.length -1;
                            refiners2.childrenCounts.push( 0 );
                            refiners2.childrenMultiCounts.push( 0 );
                        }
                        refiners2.multiCount ++;
                        refiners2.childrenCounts[topKey2] ++;
                        refiners2.childrenMultiCounts[topKey2] ++;
                        if ( r2 == '0') { refiners2.itemCount ++; }
                        //now with topKey values, do second layer
                    }

                    //now with topKey values, do second layer
                }

                //now with topKey values, do second layer
            }


        }
    }

    return refiners;

}

//   d888b  d88888b d888888b      d8888b. d88888b d88888b d888888b d8b   db d88888b d8888b. 
//  88' Y8b 88'     `~~88~~'      88  `8D 88'     88'       `88'   888o  88 88'     88  `8D 
//  88      88ooooo    88         88oobY' 88ooooo 88ooo      88    88V8o 88 88ooooo 88oobY' 
//  88  ooo 88~~~~~    88         88`8b   88~~~~~ 88~~~      88    88 V8o88 88~~~~~ 88`8b   
//  88. ~8~ 88.        88         88 `88. 88.     88        .88.   88  V888 88.     88 `88. 
//   Y888P  Y88888P    YP         88   YD Y88888P YP      Y888888P VP   V8P Y88888P 88   YD 
//                                                                                          
//        


export function getItemRefiners( drillList: IDrillList, item: IDrillItemInfo ) {
    let refiners = drillList.refiners;
    let itemRefiners : IItemRefiners = {
        lev0: [],
        lev1: [],
        lev2: [],
    };

    for ( let i in drillList.refinerStats ) {
        itemRefiners['stat' + i] = [];
    }

    if ( refiners && refiners.length > 0 ) {
        let x = 0;
        let i = 0;
        let allRules = drillList.refinerRules;
        for ( let r of refiners ) {
            if ( r != null ) {
                let thisRuleSet : any = allRules[i];
                let fieldValue = item[r];
                itemRefiners['lev' + i] = getRefinerFromField( fieldValue , thisRuleSet , drillList.emptyRefiner );
            }
            i++;
        }
    }

    itemRefiners = getRefinerStatsForItem( drillList, item, itemRefiners );

    return itemRefiners;
}

/**
 * This function should go through the stats requirements and build the applicable stat
 * @param drillList 
 * @param item 
 * @param result 
 */
export function getRefinerStatsForItem( drillList: IDrillList, item: IDrillItemInfo, itemRefiners: IItemRefiners ) {

    for ( let i in drillList.refinerStats ) {

        let primaryField = drillList.refinerStats[i].primaryField;
        let secondField = drillList.refinerStats[i].secondField;
        let title = drillList.refinerStats[i].title;
        let stat : IRefinerStatType = drillList.refinerStats[i].stat;
        let chartType = drillList.refinerStats[i].chartType;
        let evalX = drillList.refinerStats[i].eval;
        let x = RefinerStatTypes;
        let thisStat = undefined;

        let testPrimary = false;
        let primaryType : ITypeStrings = 'unknown';

        if ( primaryField !== undefined || primaryField !== null ) { testPrimary = true; }
        if ( testPrimary === true) {
            primaryType = getDetailValueType(  item[primaryField] );
        }

        let testSecond = false;
        let secondType : ITypeStrings = 'unknown';
        if ( secondField !== undefined || secondField !== null ) { testSecond = true; }
        if ( testSecond === true) {
            secondType = getDetailValueType(  item[secondField] );
        }

        if ( stat === 'sum' ) { 
            if ( primaryType === 'numberstring' ) {
                itemRefiners['stat' + i] = parseFloat(item[primaryField]) ;

            } else if ( primaryType === 'number' ) {
                itemRefiners['stat' + i] = item[primaryField] ;

            } else if ( primaryType === 'null' || primaryType === 'undefined' ) {
                console.log( item['Id'] + ' does not have a value in property: ' + primaryField + '.  assuming it\s Zero for Sum operations.' );
                itemRefiners['stat' + i] = 0 ;

            } else {
                console.log('Unable to do ' + stat + ' on ' + primaryType + ' Value...: ' + item[primaryField] + '.  assuming it\s null');
                itemRefiners['stat' + i] = null ;

            }

        } else if ( stat === 'avg' || stat === 'max' || stat === 'min' ) { 
            if ( primaryType === 'numberstring' ) {
                itemRefiners['stat' + i] = parseFloat(item[primaryField]) ;

            } else if ( primaryType === 'number' ) {
                itemRefiners['stat' + i] = item[primaryField] ;

            } else if ( primaryType === 'null' || primaryType === 'undefined' ) {
                itemRefiners['stat' + i] = null ;

            } else if ( primaryType === 'datestring' ) {
                itemRefiners['stat' + i] = new Date(item[primaryField]).getTime() ;

            } else {
                console.log('Unable to do ' + stat + ' on ' + primaryType + ' Value...: ' + item[primaryField] + '.  assuming it\s null');
                itemRefiners['stat' + i] = null ;

            }

        } else if ( stat === 'daysAgo' || stat === 'monthsAgo' ) {
            if ( primaryType === 'datestring' ) {

                itemRefiners['stat' + i] = getAge( item[primaryField], stat === 'daysAgo' ? 'days' : 'months' ) ;

            } else {
                console.log('Unable to do ' + stat + ' on ' + primaryType + ' Value...: ' + item[primaryField] + '.  assuming it\s null');
                itemRefiners['stat' + i] = null ;
            }

        } else if ( stat === 'eval' ) {
            console.log('eval is not yet available:  not calculating ' + title );

        }

    }

    return itemRefiners;
}


function getRefinerFromField ( fieldValue : any, ruleSet: RefineRuleValues[], emptyRefiner: string ) {

    let result : any[] = [];

    // Basic types copied from:  https://www.w3schools.com/js/tryit.asp?filename=tryjs_typeof_all

    let detailType = getDetailValueType ( fieldValue );

    if ( detailType === 'null' || detailType === 'undefined' || detailType === 'function' ){
        result = [ emptyRefiner ];

    } else if ( detailType === 'boolean' || detailType === 'number'  ){
        result = [ fieldValue ];

    } else if ( detailType === 'array' ){
        result = fieldValue;

    } else if ( detailType === 'object' ){
        result = [ JSON.stringify(fieldValue) ];
    
    } else if ( detailType === 'datestring' ) {
        let tempDate = makeTheTimeObject( fieldValue );
        let reFormattedDate = null;
        // 'groupByDays' | 'groupByWeeks' |  'groupByMonths' |  'groupByYears' | 'groupByDayOfWeek' | 
        if ( ruleSet.indexOf('groupByDays') > -1 ) {
            reFormattedDate = tempDate.dayYYYYMMDD;

        } else if ( ruleSet.indexOf('groupByWeeks') > -1 ) {
            reFormattedDate = tempDate.year + '-'+ tempDate.week;

        } else if ( ruleSet.indexOf('groupByMonthsYYMM') > -1 ) {
            reFormattedDate = tempDate.year + '-'+ ("0" + (tempDate.month + 1)).slice(-2) ;

        } else if ( ruleSet.indexOf('groupByMonthsMMM') > -1 ) {
            reFormattedDate = monthStr3['en-us'][tempDate.month] ;

        } else if ( ruleSet.indexOf('groupByYears') > -1 ) {
            reFormattedDate = tempDate.year.toString();

        } else if ( ruleSet.indexOf('groupByDayOfWeek') > -1 ) {
            reFormattedDate = tempDate.dayOfWeekDDD;

        } else if ( ruleSet.indexOf('groupByDateBuckets') > -1 ) {
            if ( tempDate.daysAgo > 360 ) {
                reFormattedDate = '\> 1 Year' ;

            } else if ( tempDate.daysAgo > 30 ) {
                reFormattedDate = '\> 1 Month' ;

            } else if ( tempDate.daysAgo > 7 ) {
                reFormattedDate = '\> 1 Week' ;

            } else if ( tempDate.daysAgo > 1 ) {
                reFormattedDate = '\> 1 Day' ;
                
            } else { reFormattedDate = 'Today' ; }

        } 
        result = [ reFormattedDate ];

    } else if ( detailType === 'string' ){

        //If it's a string, then test if it's a date, return the best date in an array.   Object.prototype.toString.call(date) === '[object Date]'  //https://stackoverflow.com/a/643827
        //As of 2020-09-01:  This does not accurately detect dates.

                //parse by semiColon or comma if rule dictates
        if ( ruleSet.indexOf('parseBySemiColons')  > -1 && fieldValue.indexOf(';') > -1 ) {
            fieldValue = getRefinerFromField ( fieldValue.split(';') , ruleSet, emptyRefiner );

        } else if (ruleSet.indexOf('parseByCommas')  > -1 && fieldValue.indexOf(',') > -1 ) {
            fieldValue = getRefinerFromField ( fieldValue.split(',') , ruleSet, emptyRefiner );

        } else { // This should be a string
            result = [ fieldValue ];

        }

    }

    return result;

}

export function getBestFieldType ( item: any ) {

let thisType = 'unknown';




}

//  d8888b. db    db d888888b db      d8888b.      .88b  d88. d88888b d888888b  .d8b.  
//  88  `8D 88    88   `88'   88      88  `8D      88'YbdP`88 88'     `~~88~~' d8' `8b 
//  88oooY' 88    88    88    88      88   88      88  88  88 88ooooo    88    88ooo88 
//  88~~~b. 88    88    88    88      88   88      88  88  88 88~~~~~    88    88~~~88 
//  88   8D 88b  d88   .88.   88booo. 88  .8D      88  88  88 88.        88    88   88 
//  Y8888P' ~Y8888P' Y888888P Y88888P Y8888D'      YP  YP  YP Y88888P    YP    YP   YP 
//                                                                                     
//     

function buildMetaFromItem( theItem: IDrillItemInfo ) {
    let meta: string[] = ['All'];

    if ( theItem.timeCreated.daysAgo === 0 ) {
        meta = addItemToArrayIfItDoesNotExist(meta, 'New');
    } else {
        meta = theItem.timeCreated.daysAgo < 180 ? addItemToArrayIfItDoesNotExist(meta, 'RecentlyCreated') : addItemToArrayIfItDoesNotExist(meta, 'Old');
    }

    meta = theItem.timeModified.daysAgo < 180 ? addItemToArrayIfItDoesNotExist(meta, 'RecentlyUpdated') : addItemToArrayIfItDoesNotExist(meta, 'Stale');

    for ( let L of Object.keys(theItem.refiners) ) {
        //Gets rid of the 'undefined' meta key found at the end of the keys
        //Only do this if it is the lev0, lev1 or lev2 arrays
        if (L.indexOf('lev') === 0 ) { 
            for ( let R in theItem.refiners[L] ) {
                meta = addItemToArrayIfItDoesNotExist(meta, theItem.refiners[L][R]);
            }
        }
    }

    meta = addItemToArrayIfItDoesNotExist(meta, theItem.sort );

    return meta;
}

//  d8888b. db    db d888888b db      d8888b.      .d8888. d88888b  .d8b.  d8888b.  .o88b. db   db 
//  88  `8D 88    88   `88'   88      88  `8D      88'  YP 88'     d8' `8b 88  `8D d8P  Y8 88   88 
//  88oooY' 88    88    88    88      88   88      `8bo.   88ooooo 88ooo88 88oobY' 8P      88ooo88 
//  88~~~b. 88    88    88    88      88   88        `Y8b. 88~~~~~ 88~~~88 88`8b   8b      88~~~88 
//  88   8D 88b  d88   .88.   88booo. 88  .8D      db   8D 88.     88   88 88 `88. Y8b  d8 88   88 
//  Y8888P' ~Y8888P' Y888888P Y88888P Y8888D'      `8888Y' Y88888P YP   YP 88   YD  `Y88P' YP   YP 
//                                                                                                 
//         

function buildSearchStringFromItem (newItem : IDrillItemInfo) {

    let result = '';
    let delim = '|||';

    if ( newItem.Title ) { result += 'Title=' + newItem.Title + delim ; }

    if ( newItem.Comments ) { result += 'Comments=' + newItem.Comments + delim ; }
    if ( newItem.Story ) { result += 'Story=' + newItem.Story + delim ; }
    if ( newItem.Chapter ) { result += 'Chapter=' + newItem.Chapter + delim ; }
    if ( newItem.ProjectID1 ) { result += 'ProjectID1=' + newItem.ProjectID1 + delim ; }
    if ( newItem.ProjectID2 ) { result += 'ProjectID2=' + newItem.ProjectID1 + delim ; }

    if ( newItem.StartTime ) { result += 'StartTime=' + newItem.StartTime + delim ; }

    if ( newItem.Id ) { result += 'Id=' + newItem.Id + delim ; }

    if ( newItem['odata.type'] ) { result += newItem['odata.type'] + delim ; }

    if ( newItem.meta.length > 0 ) { result += 'Meta=' + newItem.meta.join(',') + delim ; }

    result = result.toLowerCase();

    return result;

}
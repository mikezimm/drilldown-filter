import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'DrilldownWebPartStrings';
import DrillDown from './components/Drill/drillComponent';
import { IDrillDownProps } from './components/Drill/drillComponent';

import { PageContext } from '@microsoft/sp-page-context';

import { makeTheTimeObject } from '../../services/dateServices';
import { saveTheTime, getTheCurrentTime, saveAnalytics } from '../../services/createAnalytics';

import { getHelpfullError, } from '../../services/ErrorHandler';

import { sp } from '@pnp/sp';

import { propertyPaneBuilder } from '../../services/propPane/PropPaneBuilder';

import { IMyProgress, ICustViewDef } from './components/IReUsableInterfaces';

// 2020-09-08:  Add for dynamic data refiners.
import { IDynamicDataCallables, IDynamicDataPropertyDefinition } from '@microsoft/sp-dynamic-data';

import { RefineRuleValues } from './components/IReUsableInterfaces';


export interface IDrilldownWebPartProps {

  description: string;

  // 0 - Context
  pageContext: PageContext;

  // 1 - Analytics options
  useListAnalytics: boolean;
  analyticsWeb?: string;
  analyticsList?: string;
  stressMultiplier?: number;

  // 2 - Source and destination list information
  createVerifyLists: boolean;
  parentListTitle: string;
  parentListWeb: string;

  refiner0: string;
  refiner1: string;
  refiner2: string;

  rules0def: string;
  rules1def: string;
  rules2def: string;

  rules0: string[];
  rules1: string[];
  rules2: string[];

  showDisabled?: boolean;
  updateRefinersOnTextSearch?: boolean;

  parentListFieldTitles: string;

  onlyActiveParents: boolean;

  // 3 - General how accurate do you want this to be

  // 4 - Info Options

  // 5 - UI Defaults

  viewWidth1: number;
  viewWidth2: number;
  viewWidth3: number;

  viewJSON1: string;
  viewJSON2: string;
  viewJSON3: string;

  // 6 - User Feedback:
  progress: IMyProgress;

  // 7 - TBD

  // 9 - Other web part options
  webPartScenario: string; //Choice used to create mutiple versions of the webpart.

  advancedPivotStyles: boolean;
  pivotSize: string;
  pivotFormat: string;
  pivotOptions: string;
  pivotTab: string;
}

export default class DrilldownWebPart extends BaseClientSideWebPart<IDrilldownWebPartProps> {


/**
 * 2020-09-08:  Add for dynamic data refiners.
 */
private _selectedRefiner0Name: string;
private _selectedRefiner0Value: string;
private _filterBy: any;



/***
*          .d88b.  d8b   db d888888b d8b   db d888888b d888888b 
*         .8P  Y8. 888o  88   `88'   888o  88   `88'   `~~88~~' 
*         88    88 88V8o 88    88    88V8o 88    88       88    
*         88    88 88 V8o88    88    88 V8o88    88       88    
*         `8b  d8' 88  V888   .88.   88  V888   .88.      88    
*          `Y88P'  VP   V8P Y888888P VP   V8P Y888888P    YP    
*                                                               
*                                                               
*/

  //Added for Get List Data:  https://www.youtube.com/watch?v=b9Ymnicb1kc
  public onInit():Promise<void> {
    return super.onInit().then(_ => {
      
      //2020-09-08:  Add for dynamic data refiners.
      this.context.dynamicDataSourceManager.initializeSource(this);


      // other init code may be present

      let mess = 'onInit - ONINIT: ' + new Date().toLocaleTimeString();

      console.log(mess);

      //https://stackoverflow.com/questions/52010321/sharepoint-online-full-width-page
      if ( window.location.href &&  
        window.location.href.toLowerCase().indexOf("layouts/15/workbench.aspx") > 0 ) {
          
        if (document.getElementById("workbenchPageContent")) {
          document.getElementById("workbenchPageContent").style.maxWidth = "none";
        }
      } 

      //console.log('window.location',window.location);
      sp.setup({
        spfxContext: this.context
      });
    });
  }


  /**
   * 2020-09-08:  Add for dynamic data refiners.   public getPropertyDefinitions():
   * 
   */
  public getPropertyDefinitions(): ReadonlyArray<IDynamicDataPropertyDefinition>{
    return [
      {
        id: 'refiner0Name',
        title: 'Field you are filtering on',
      },
      {
        id: 'refiner0Value',
        title: 'Value you are filtering on',
      },
      {
        id: 'filterBy',
        title: 'Filter by refiner component',
      }
    ];
  }

  /**
   * 2020-09-08:  Add for dynamic data refiners.   public getPropertyValue:
   * @param propertyId 
   */
  public getPropertyValue(propertyId: string): string {
    switch(propertyId) {
      case 'refiner0Name': 
        return this._selectedRefiner0Name;
      case 'refiner0Value':
        return this._selectedRefiner0Value;
      case 'filterBy':
        return this._filterBy;
    }
    throw new Error('Bad property ID');

  }


  public getUrlVars(): {} {
    var vars = {};
    vars = location.search
    .slice(1)
    .split('&')
    .map(p => p.split('='))
    .reduce((obj, pair) => {
      const [key, value] = pair.map(decodeURIComponent);
      return ({ ...obj, [key]: value }) ;
    }, {});
    return vars;
  }

  public getViewFieldsObject(message: string, str: string) {

    let result : any = undefined;
    
    if ( str === null || str === undefined ) { return result; }
    try {
      result = JSON.parse(str);
    } catch(e) {
      alert(message + ' is not a valid JSON object.  Please fix it and re-run');
    }
    
    return result;
  }


  public render(): void {

    //Be sure to always pass down an actual URL if the webpart prop is empty at this point.
    //If it's undefined, null or '', get current page context value
    let parentWeb = this.properties.parentListWeb && this.properties.parentListWeb != '' ? this.properties.parentListWeb : this.context.pageContext.web.absoluteUrl;

    let refiners: string[] = [];

    if ( this.properties.refiner0 && this.properties.refiner0.length > 0 ) { refiners.push( this.properties.refiner0 ) ;}
    if ( this.properties.refiner1 && this.properties.refiner1.length > 0 ) { refiners.push( this.properties.refiner1 ) ;}
    if ( this.properties.refiner2 && this.properties.refiner2.length > 0 ) { refiners.push( this.properties.refiner2 ) ;}

    //Sample rules
    let rules1: RefineRuleValues[] = ['parseBySemiColons'];
    let rules2: RefineRuleValues[] = ['parseBySemiColons'];
    let rules3: RefineRuleValues[] = ['groupByMonthsMMM'];

    this.properties.rules0 = [this.properties.rules0def];
    this.properties.rules1 = [this.properties.rules1def];
    this.properties.rules2 = [this.properties.rules2def];

    let rules = [];
    if ( this.properties.rules0 && this.properties.rules0.length > 0 ) { rules.push ( this.properties.rules0 ) ; } else { rules.push( ['']) ; }
    if ( this.properties.rules1 && this.properties.rules1.length > 0 ) { rules.push ( this.properties.rules1) ; } else { rules.push( ['']) ; }
    if ( this.properties.rules2 && this.properties.rules2.length > 0 ) { rules.push ( this.properties.rules2) ; } else { rules.push( ['']) ; }

    let viewDefs : ICustViewDef[] = [];
    let viewFields1 = this.getViewFieldsObject('Full Size view', this.properties.viewJSON1 );
    let viewFields2 = this.getViewFieldsObject('Med Size view', this.properties.viewJSON2 );
    let viewFields3 = this.getViewFieldsObject('Small Size view', this.properties.viewJSON3 );

    if (viewFields1 !== undefined ) { viewDefs.push( { minWidth: this.properties.viewWidth1, viewFields: viewFields1 }); }
    if (viewFields2 !== undefined ) { viewDefs.push( { minWidth: this.properties.viewWidth2, viewFields: viewFields2 }); }
    if (viewFields3 !== undefined ) { viewDefs.push( { minWidth: this.properties.viewWidth3, viewFields: viewFields3 }); }

    console.log('Here are view Defs:', viewDefs );

    let stringRules: string = JSON.stringify( rules );

    //Just for test purposes
    //stringRules = JSON.stringify( [rules1,rules2,rules3] );

    const element: React.ReactElement<IDrillDownProps> = React.createElement(
      DrillDown,
      {
        description: 'this.properties.description',
        
        // 0 - Context
        pageContext: this.context.pageContext,
        wpContext: this.context,
        tenant: this.context.pageContext.web.absoluteUrl.replace(this.context.pageContext.web.serverRelativeUrl,""),
        urlVars: this.getUrlVars(),
        today: makeTheTimeObject(''),
        parentListFieldTitles: this.properties.parentListFieldTitles,

        //Size courtesy of https://www.netwoven.com/2018/11/13/resizing-of-spfx-react-web-parts-in-different-scenarios/
        WebpartElement: this.domElement,

        // 1 - Analytics options
        useListAnalytics: this.properties.useListAnalytics,
        analyticsWeb: strings.analyticsWeb,
        analyticsList: strings.analyticsList,
      
        // 2 - Source and destination list information
        listName: this.properties.parentListTitle,
        webURL: parentWeb,

        refiners: refiners,
        showDisabled: this.properties.showDisabled,
        updateRefinersOnTextSearch: this.properties.updateRefinersOnTextSearch ? this.properties.updateRefinersOnTextSearch : false,

        rules: stringRules,

        allLoaded: true,

        style: 'commandBar',
        viewDefs: viewDefs,


        // 3 - General how accurate do you want this to be

        // 4 - Info Options

        // 5 - UI Defaults

        // 6 - User Feedback:
        /*
        progress: {
          label: '',
          description: '',
          percentComplete: 0,
          progressHidden: true,
        },
        */
        progress: null,
        // 7 - TBD

        // 9 - Other web part options
        WebpartHeight: this.domElement.getBoundingClientRect().height ,
        WebpartWidth:  this.domElement.getBoundingClientRect().width - 50 ,
  
        pivotSize: this.properties.pivotSize,
        pivotFormat: this.properties.pivotFormat,
        pivotOptions: this.properties.pivotOptions,
        pivotTab: 'Projects', //this.properties.pivotTab (was setTab in pivot-tiles)
        
        onRefiner0Selected: this._handleRefiner0Selected,
      }
    );

    ReactDom.render(element, this.domElement);
  }


  /**
   * 2020-09-08:  Add for dynamic data refiners.   private handleFieldSelected:
   * @param field 
   */
  private _handleRefiner0Selected = ( field: string, value: any ) : void => {
    console.log( '_handleRefiner0Selected:', field, value );
    this._selectedRefiner0Name = field;
    this._selectedRefiner0Value = value;
    this._filterBy = {
      field: field,
      value: value,
    };

    console.log('Main Webpart: Refiners updated: ', field, value);
    this.context.dynamicDataSourceManager.notifyPropertyChanged('refiner0Name');
    this.context.dynamicDataSourceManager.notifyPropertyChanged('refiner0Value');
    this.context.dynamicDataSourceManager.notifyPropertyChanged('filterBy');

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }


  private async UpdateTitles(): Promise<boolean> {

    let listName = this.properties.parentListTitle ? this.properties.parentListTitle : 'ParentListTitle';
    const list = sp.web.lists.getByTitle(listName);
    const r = await list.fields();

    //2020-05-13:  Remove Active since it's replaced with StatusTMT which is not applicable here
    let defFields = ["Title","Author","Editor","Created","Modified"];
    let filterFields=[]; //["SSChoice1","SSChoiceA","MSChoice2","MSChoiceB"];
    if ( this.properties.refiner0 != '' ) { filterFields.push( this.properties.refiner0 ); }
    if ( this.properties.refiner1 != '' ) { filterFields.push( this.properties.refiner1 ); }
    if ( this.properties.refiner2 != '' ) { filterFields.push( this.properties.refiner2 ); }

    let allFields = defFields.concat(filterFields);

    let fieldTitles = r.filter(f => f.Hidden !== true && allFields.indexOf(f.StaticName) > -1).map( 
      f => {return [f.StaticName,f.Title,f.Description,f.Required,f.FieldTypeKind];});
    
    //Update properties here:
    this.properties.parentListFieldTitles = JSON.stringify(fieldTitles);

    console.log('list fields: ', r);
    console.log('fieldTitles: ', fieldTitles);
    
    return true;

  } 


  /***
  *         d8888b. d8888b.  .d88b.  d8888b.      d8888b.  .d8b.  d8b   db d88888b 
  *         88  `8D 88  `8D .8P  Y8. 88  `8D      88  `8D d8' `8b 888o  88 88'     
  *         88oodD' 88oobY' 88    88 88oodD'      88oodD' 88ooo88 88V8o 88 88ooooo 
  *         88~~~   88`8b   88    88 88~~~        88~~~   88~~~88 88 V8o88 88~~~~~ 
  *         88      88 `88. `8b  d8' 88           88      88   88 88  V888 88.     
  *         88      88   YD  `Y88P'  88           88      YP   YP VP   V8P Y88888P 
  *                                                                                
  *                                                                                
  */


  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return propertyPaneBuilder.getPropertyPaneConfiguration(
      this.properties,
      this.UpdateTitles.bind(this),
      );
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {

    /**
     * This section is used to determine when to refresh the pane options
     */
    let updateOnThese = [
      'setSize','setTab','otherTab','setTab','otherTab','setTab','otherTab','setTab','otherTab',
      'parentListFieldTitles','progress','UpdateTitles','parentListTitle','childListTitle','parentListWeb','childListWeb'
    ];
    //alert('props updated');
    console.log('onPropertyPaneFieldChanged:', propertyPath, oldValue, newValue);
    if (updateOnThese.indexOf(propertyPath) > -1 ) {
      this.properties[propertyPath] = newValue;   
      this.context.propertyPane.refresh();

    } else { //This can be removed if it works

    }
    this.render();
  }
}

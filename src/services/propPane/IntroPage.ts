import {
  IPropertyPanePage,
  PropertyPaneLabel,
  IPropertyPaneLabelProps,
  PropertyPaneHorizontalRule,
  PropertyPaneTextField, IPropertyPaneTextFieldProps,
  PropertyPaneLink, IPropertyPaneLinkProps,
  PropertyPaneDropdown, IPropertyPaneDropdownProps,
  IPropertyPaneDropdownOption,PropertyPaneToggle,
  IPropertyPaneConfiguration,
  PropertyPaneButton,
  PropertyPaneButtonType,
} from '@microsoft/sp-property-pane';

import { PropertyFieldMultiSelect } from '@pnp/spfx-property-controls/lib/PropertyFieldMultiSelect';

import * as strings from 'DrilldownWebPartStrings';
import { pivotOptionsGroup} from './index';

import * as links from '../../webparts/drilldown/components/HelpInfo/AllLinks';   //              { links.gitRepoDrilldownWebpart.issues }

import { IDrilldownWebPartProps } from '../../webparts/drilldown/DrilldownWebPart';

import { refinerRuleItems } from '../../webparts/drilldown/components/IReUsableInterfaces';
/*

  // 1 - Analytics options
  useListAnalytics: boolean;
  analyticsWeb?: string;
  analyticsList?: string;

  // 2 - Source and destination list information
  projectListTitle: string;
  projectListWeb: string;

  timeTrackListTitle: string;
  timeTrackListWeb: string;

  // 3 - General how accurate do you want this to be
  roundTime: string; //Up 5 minutes, Down 5 minutes, No Rounding;
  forceCurrentUser: boolean; //false allows you to put in data for someone else
  confirmPrompt: boolean;  //Make user press confirm

  // 4 -Project options
  allowUserProjects: boolean; //Will build list of ProjectsUser based on existing data from GenericWebpart list
  projectMasterPriority: string; //Use to determine what projects float to top.... your most recent?  last day?
  projectUserPriority: string; //Use to determine what projects float to top.... your most recent?  last day?

  // 5 - UI Defaults
  defaultProjectPicker: string; //Recent, Your Projects, All Projects etc...
  defaultTimePicker: string; //SinceLast, Slider, Manual???

  // 6 - User Feedback:
  showElapsedTimeSinceLast: boolean;  // Idea is that it can be like a clock showing how long it's been since your last entry.

  // Target will be used to provide user feedback on how much/well they are tracking time
  showTargetBar: boolean; //Eventually have some kind of way to tell user that x% of hours have been entered for day/week
  showTargetToggle: boolean; //Maybe give user option to toggle between day/week
  targetType:  string; //Day, Week, Both?
  targetValue: number; //Hours for typical day/week

  // 7 - Slider Options
  showTimeSlider: boolean; //true allows you to define end time and slider for how long you spent
  timeSliderInc: number; //incriment of time slider
  timeSliderMax: number; //max of time slider

  // 9 - Other web part options
  webPartScenario: string; //Choice used to create mutiple versions of the webpart.

  pivotSize: string;
  pivotFormat: string;
  pivotOptions: string;

    */

export class IntroPage {
  public getPropertyPanePage(webPartProps: IDrilldownWebPartProps, _onClickUpdateTitles ): IPropertyPanePage {

    let ruleChoices = refinerRuleItems();
    let showDisabled = false;

    if ( webPartProps.rules2 && ( webPartProps.rules2.indexOf('groupByDayOfWeek') > -1 ||  webPartProps.rules2.indexOf('groupByMonthsMMM') > -1 ) ) { showDisabled = true;}

    return <IPropertyPanePage>
    { // <page1>
      header: {
        description: strings.PropertyPaneAbout
      },
      displayGroupsAsAccordion: true,
      groups: [
        { groupName: 'Web Part Info',
          isCollapsed: true ,
          groupFields: [
            PropertyPaneLabel('About Text', {
              text: 'This webpart gets helps track your time using SharePoint :).'
            }),

            PropertyPaneLink('About Link' , {
              text: 'Github Repo:  ' + links.gitRepoDrilldownWebpart.desc ,
              href: links.gitRepoDrilldownWebpart.href,
              target: links.gitRepoDrilldownWebpart.target,
            }),
          ]
        },


                
        // 2 - Source and destination list information
        {  groupName: 'Create-Verify Lists',
            isCollapsed: true ,
            groupFields: [

            PropertyPaneLabel('Notice', {
              text: 'NOTE:  It may take 5-20 seconds to create/verify list.  Do NOT close browser or interupt while it is creating lists.'
            }),

            PropertyPaneLabel('Notice', {
              text: ''
            }),
/*
            PropertyPaneButton('CreateParentList',  
            {  
             text: "Create/Verify Parents List",
             buttonType: PropertyPaneButtonType.Primary,
             onClick: _onClickCreateParent
            }),
*/
            PropertyPaneLabel('Notice', {
              text: ''
            }),
/*
            PropertyPaneButton('CreateChildList',
            {  
             text: "Create/Verify Child List",  
             buttonType: PropertyPaneButtonType.Primary,
             onClick: _onClickCreateChild
            }),
*/
            
            PropertyPaneButton('UpdateTitles',
            {  
             text: "Update Column Titles",  
             description: "Copy list title to WebPart",
             buttonType: PropertyPaneButtonType.Compound,
             onClick: _onClickUpdateTitles
            }),

            PropertyPaneTextField('parentListFieldTitles', {
              label: 'Advanced Field Settings',
              description: 'For changing webpart field titles',
              multiline: true,
            }),
/*
            PropertyPaneLabel('FieldInfo', {
              text: webPartProps.projectListFieldTitles
            }),
*/

          ]}, // this group




        // 2 - Source and destination list information    
        { groupName: 'Your list info',
        isCollapsed: true ,
        groupFields: [
          PropertyPaneTextField('parentListWeb', {
              label: strings.FieldLabel_ParentListWeb
          }),
          PropertyPaneTextField('parentListTitle', {
            label: strings.FieldLabel_ParentListTitle
          }),
        ]}, // this group

        { groupName: 'Performance Properties',
        isCollapsed: true ,
        groupFields: [
          PropertyPaneToggle('updateRefinersOnTextSearch', {
            label: 'Update Refiners on text search',
            offText: 'No = Faster',
            onText: 'Yes = Slower',
          }),
        ]}, // this group


        //updateRefinersOnTextSearch
/* */
        
//refinerRuleItems

/**
 * 
"FieldLabel_Refiner0": "Refiner 1 Column Name",
"FieldLabel_Refiner1": "Refiner 2 Column Name",
"FieldLabel_Refiner2": "Refiner 3 Column Name",

"FieldLabel_RulesFind": "See Help > Advanced for details",
"FieldLabel_Rule0": "Refiner 1 Rules",
"FieldLabel_Rule1": "Refiner 2 Rules",
"FieldLabel_Rule2": "Refiner 3 Rules",
 */


        // 2 - Source and destination list information    
        { groupName: 'Your Refiner info',
        isCollapsed: true ,
        groupFields: [
          PropertyPaneLabel('Notice', {
            text: 'Enter STATIC Name of column, pick any advanced coversion rules.',
          }),
          PropertyPaneLabel('Notice', {
            text: strings.FieldLabel_RulesFind,
          }),
          PropertyPaneTextField('refiner0', {
              label: strings.FieldLabel_Refiner0,
          }),
          PropertyFieldMultiSelect('rules0', {
            key: 'rules0',
            label: strings.FieldLabel_Rule0,
            options: ruleChoices,
            selectedKeys: webPartProps.rules0,
          }),
          PropertyPaneTextField('refiner1', {
            label: strings.FieldLabel_Refiner1
          }),
          PropertyFieldMultiSelect('rules1', {
            key: 'rules1',
            label: strings.FieldLabel_Rule1,
            options: ruleChoices,
            selectedKeys: webPartProps.rules1,
          }),
          PropertyPaneTextField('refiner2', {
            label: strings.FieldLabel_Refiner2
          }),
          PropertyFieldMultiSelect('rules2', {
            key: 'rules2',
            label: strings.FieldLabel_Rule2,
            options: ruleChoices,
            selectedKeys: webPartProps.rules2,
          }),
          PropertyPaneToggle('showDisabled', {
            label: 'Show disabled GroupBy',
            offText: '',
            onText: '',
            disabled: !showDisabled,
          }),
        ]}, // this group
/* */

        // 9 - Other web part options
        { groupName: 'Pivot Styles (headings)',
          isCollapsed: true ,
          groupFields: [
            PropertyPaneDropdown('pivotSize', <IPropertyPaneDropdownProps>{
              label: strings.FieldLabel_PivSize,
              options: pivotOptionsGroup.pivSizeChoices,
            }),
            PropertyPaneDropdown('pivotFormat', <IPropertyPaneDropdownProps>{
              label: strings.FieldLabel_PivFormat,
              options: pivotOptionsGroup.pivFormatChoices,
            }),
            PropertyPaneDropdown('pivotOptions', <IPropertyPaneDropdownProps>{
              label: strings.FieldLabel_PivOptions,
              options: pivotOptionsGroup.pivOptionsChoices,
              disabled: true,
            }),
          ]}, // this group

        ]}; // Groups
  } // getPropertyPanePage()
}

export let introPage = new IntroPage();
import {
    IPropertyPanePage,
    PropertyPaneLabel,
    IPropertyPaneLabelProps,
    PropertyPaneHorizontalRule,
    PropertyPaneTextField, IPropertyPaneTextFieldProps,
    PropertyPaneLink, IPropertyPaneLinkProps,PropertyPaneSlider,
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
  
  export class ViewsPage {
    public getPropertyPanePage(webPartProps: IDrilldownWebPartProps ): IPropertyPanePage {
  
      let ruleChoices = refinerRuleItems();
      let showDisabled = false;
  
      if ( webPartProps.rules2 && ( webPartProps.rules2.indexOf('groupByDayOfWeek') > -1 ||  webPartProps.rules2.indexOf('groupByMonthsMMM') > -1 ) ) { showDisabled = true;}
  
      return <IPropertyPanePage>
      { // <page1>
        header: {
          description: 'Set up list views'
        },
        displayGroupsAsAccordion: true,
        groups: [
          { groupName: 'How to customize your views',
            isCollapsed: true ,
            groupFields: [
              PropertyPaneLabel('About Text', {
                text: 'Customize your list view here'
              }),
  
              PropertyPaneLabel('About Text', {
                text: 'Copy your view settings and use this site to modify them.  Then copy them back and paste into settings box.'
              }),
  
              PropertyPaneLink('About Link' , {
                text: 'Use this site to more easily work on JSON',
                href: 'https://codebeautify.org/jsonviewer',
                target: '_blank',
              }),

              PropertyPaneLabel('About Text', {
                text: 'View settings need to be structured in IViewField[] array format documented here:'
              }),

              PropertyPaneLink('JSON Link' , {
                text: 'See IViewField definition',
                href: 'https://pnp.github.io/sp-dev-fx-controls-react/controls/ListView/#implementation',
                target: '_blank',
                }),


            PropertyPaneLabel('Minimum properties', {text: '{' }),
            PropertyPaneLabel('Minimum properties', {text: '  name: <Static Name of Column>' }),
            PropertyPaneLabel('Minimum properties', {text: '  displayName: <Title of Column>' }),
            PropertyPaneLabel('Minimum properties', {text: '  minWidth: <min default width of column>' }),
            PropertyPaneLabel('Minimum properties', {text: '}' }),

            ]
          },
         
//groupByFields
          // 2 - Source and destination list information
          {  groupName: 'List Grouping',
              isCollapsed: true ,
              groupFields: [
                PropertyPaneTextField('groupByFields', {
                    label: 'Group by Fields',
                    description: 'Semi-colon separated Static Column names',
                    }),
  
            ]}, // this group

          // 2 - Source and destination list information
          {  groupName: 'Full Size list',
              isCollapsed: true ,
              groupFields: [
  
                PropertyPaneSlider('viewWidth1', {
                    label: 'Min width for Wide view',
                    min: 400,
                    max: 1600,
                    step: 100,
                    value: 1200,
                    }),

                PropertyPaneLink('JSON Link' , {
                    text: 'Use this site to more easily work on JSON',
                    href: 'https://codebeautify.org/jsonviewer',
                    target: '_blank',
                    }),

                PropertyPaneTextField('viewJSON1', {
                    label: 'View settings',
                    description: 'For changing webpart field titles',
                    multiline: true,
                    }),
  
            ]}, // this group
 
          // 2 - Source and destination list information
          {  groupName: 'Medium Size list',
              isCollapsed: true ,
              groupFields: [
  
                PropertyPaneSlider('viewWidth2', {
                    label: 'Min width for Wide view',
                    min: 400,
                    max: 1600,
                    step: 100,
                    value: 800,
                    }),

                PropertyPaneLink('JSON Link' , {
                    text: 'Use this site to more easily work on JSON',
                    href: 'https://codebeautify.org/jsonviewer',
                    target: '_blank',
                    }),

                PropertyPaneTextField('viewJSON2', {
                    label: 'View settings',
                    description: 'For changing webpart field titles',
                    multiline: true,
                    }),
  
            ]}, // this group
            
          // 2 - Source and destination list information
          {  groupName: 'Small Size list',
              isCollapsed: true ,
              groupFields: [
  
                PropertyPaneSlider('viewWidth3', {
                    label: 'Min width for Wide view',
                    min: 400,
                    max: 1600,
                    step: 100,
                    value: 400,
                    }),

                PropertyPaneLink('JSON Link' , {
                    text: 'Use this site to more easily work on JSON',
                    href: 'https://codebeautify.org/jsonviewer',
                    target: '_blank',
                    }),


                PropertyPaneTextField('viewJSON3', {
                    label: 'View settings',
                    description: 'For changing webpart field titles',
                    multiline: true,
                    }),
  
            ]}, // this group

          // 2 - Source and destination list information
          {  groupName: 'Details button',
              isCollapsed: true ,
              groupFields: [
                PropertyPaneToggle('includeDetails', {
                    label: 'Include details panel',
                    offText: 'No',
                    onText: 'Yes',
                  }),
  
            ]}, // this group




          ]}; // Groups
    } // getPropertyPanePage()
  }
  
  export let viewsPage = new ViewsPage();
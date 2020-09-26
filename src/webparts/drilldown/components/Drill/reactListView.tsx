
import * as React from 'react';
import { Icon  } from 'office-ui-fabric-react/lib/Icon';

import { IMyProgress, } from '../IReUsableInterfaces';
import { IDrillItemInfo } from './drillComponent';

import { autoDetailsList } from '../../../../services/hoverCardService';

import { doesObjectExistInArray,  } from '../../../../services/arrayServices';


import stylesL from '../ListView/listView.module.scss';
import { ListView, IViewField, SelectionMode, GroupOrder, IGrouping, } from "@pnp/spfx-controls-react/lib/ListView";
import { IGroup } from 'office-ui-fabric-react/lib/components/DetailsList';

import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';
import { Fabric, Stack, IStackTokens, initializeIcons } from 'office-ui-fabric-react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';


import styles from '../Contents/listView.module.scss';
import stylesInfo from '../HelpInfo/InfoPane.module.scss';
import { IView } from '@pnp/sp/views';

export interface IReactListItemsProps {
    title?: string;
    descending?: boolean;
    maxChars?: number;
    items: IDrillItemInfo[];

    blueBar?: any;

    showIDs?: boolean;
    showDesc?: boolean;

    parentListFieldTitles?: string;
    viewFields?: IViewField[];

    groupByFields?:  IGrouping[];
    includeDetails: boolean;

}

export interface IReactListItemsState {
  maxChars?: number;
  parentListFieldTitles: any;
  viewFields: IViewField[];
  showPanel: boolean;
  panelId: number;
  panelItem: IDrillItemInfo;
}

const stackFormRowTokens: IStackTokens = { childrenGap: 10 };

const iconClassAction = mergeStyles({
  fontSize: 18,
  fontWeight: "bolder",
  color: "black",
  //margin: '0px 2px',
  paddingRight: '10px',
  verticalAlign: 'bottom',
});

const iconClassInfo = mergeStyles({
  fontSize: 18,
  //margin: '0px 2px',
  paddingRight: '10px',
  verticalAlign: 'bottom',
});


export default class ReactListItems extends React.Component<IReactListItemsProps, IReactListItemsState> {


    private covertFieldInfoToIViewFields( parentListFieldTitles: [] , fieldsToShow: string[] ) {

        /**
         * This is the export format required:
            export const  initials : IViewField = {
            name: "userInitials",
            displayName: "User",
            isResizable: true,
            sorting: true,
            minWidth: 10,
            maxWidth: 30
        };
         */
        let viewFields : IViewField[] = [];
        
        if ( fieldsToShow.length === 0 ) { //Do all in order of fieldInfo
            if ( parentListFieldTitles.length > 0 ) { //Do all in order of fieldInfo
                parentListFieldTitles.map( f => {
                    viewFields.push({
                        name: f[0],
                        displayName: f[1],
                        isResizable: true,
                        sorting: true,
                        minWidth: 50,
                        maxWidth: 100
                    });
                });
            }
        }

        console.log('covertFieldInfoToIViewFields - viewFields', viewFields);
        return viewFields;

    }

    
    /***
 *          .o88b.  .d88b.  d8b   db .d8888. d888888b d8888b. db    db  .o88b. d888888b  .d88b.  d8888b. 
 *         d8P  Y8 .8P  Y8. 888o  88 88'  YP `~~88~~' 88  `8D 88    88 d8P  Y8 `~~88~~' .8P  Y8. 88  `8D 
 *         8P      88    88 88V8o 88 `8bo.      88    88oobY' 88    88 8P         88    88    88 88oobY' 
 *         8b      88    88 88 V8o88   `Y8b.    88    88`8b   88    88 8b         88    88    88 88`8b   
 *         Y8b  d8 `8b  d8' 88  V888 db   8D    88    88 `88. 88b  d88 Y8b  d8    88    `8b  d8' 88 `88. 
 *          `Y88P'  `Y88P'  VP   V8P `8888Y'    YP    88   YD ~Y8888P'  `Y88P'    YP     `Y88P'  88   YD 
 *                                                                                                       
 *                                                                                                       
 */ 

    constructor(props: IReactListItemsProps) {
        super(props);
        console.log( 'listView PROPS: ', this.props, );
        let parentListFieldTitles = this.props.parentListFieldTitles !== undefined && this.props.parentListFieldTitles !== null ? JSON.parse(this.props.parentListFieldTitles) : '';
 //       console.log( 'parentListFieldTitles', parentListFieldTitles );

        let viewFields : IViewField[] = [];
        if ( this.props.viewFields.length > 0 ) { 
            viewFields = this.props.viewFields;
        } else { 
            viewFields = this.covertFieldInfoToIViewFields( parentListFieldTitles , [] );
        }

        this.state = {
          maxChars: this.props.maxChars ? this.props.maxChars : 50,
          parentListFieldTitles:parentListFieldTitles,
          viewFields: viewFields,
          showPanel: false,
          panelId: null,
          panelItem: null,
          //viewFields: null,
        };
    }
        
    public componentDidMount() {
        //this._getListItems();
    }


/***
 *         d8888b. d888888b d8888b.      db    db d8888b. d8888b.  .d8b.  d888888b d88888b 
 *         88  `8D   `88'   88  `8D      88    88 88  `8D 88  `8D d8' `8b `~~88~~' 88'     
 *         88   88    88    88   88      88    88 88oodD' 88   88 88ooo88    88    88ooooo 
 *         88   88    88    88   88      88    88 88~~~   88   88 88~~~88    88    88~~~~~ 
 *         88  .8D   .88.   88  .8D      88b  d88 88      88  .8D 88   88    88    88.     
 *         Y8888D' Y888888P Y8888D'      ~Y8888P' 88      Y8888D' YP   YP    YP    Y88888P 
 *                                                                                         
 *                                                                                         
 */

    public componentDidUpdate(prevProps: IReactListItemsProps): void {
        let redraw = false;

        if ( prevProps.viewFields !== this.props.viewFields ) { redraw = true; }
        if ( prevProps.items.length !== this.props.items.length ) { redraw = true; }
        this._updateStateOnPropsChange();
    }

/***
 *         d8888b. d88888b d8b   db d8888b. d88888b d8888b. 
 *         88  `8D 88'     888o  88 88  `8D 88'     88  `8D 
 *         88oobY' 88ooooo 88V8o 88 88   88 88ooooo 88oobY' 
 *         88`8b   88~~~~~ 88 V8o88 88   88 88~~~~~ 88`8b   
 *         88 `88. 88.     88  V888 88  .8D 88.     88 `88. 
 *         88   YD Y88888P VP   V8P Y8888D' Y88888P 88   YD 
 *                                                          
 *                                                          
 */


    public render(): React.ReactElement<IReactListItemsProps> {

        //console.log( 'ReactListItems props & state: ', this.props, this.state );

        let thisLog = null;

        if ( this.props.items != null && this.props.items.length > 0 ) { 

            let panel = !this.state.showPanel || this.state.panelId === null || this.state.panelId === undefined || this.state.panelItem === null ? null : 
                <Panel
                    isOpen={this.state.showPanel}
                    type={ PanelType.medium }
                    onDismiss={this._onClosePanel}
                    headerText={ this.state.panelId.toString() }
                    closeButtonAriaLabel="Close"
                    onRenderFooterContent={this._onRenderFooterContent}
                    isLightDismiss={ true }
                    isFooterAtBottom={ true }
                >
                    { autoDetailsList(this.state.panelItem, ["Title","refiners"],["search","meta","searchString"],true) }
                </Panel>;

            let listView = <div>
            <ListView
                items={ this.props.items }
                viewFields={this.state.viewFields}
                compact={true}
                selectionMode={ this.props.includeDetails ? SelectionMode.single : SelectionMode.none }
                selection={this._onShowPanel.bind(this)}
                showFilter={false}
                //defaultFilter="John"
                filterPlaceHolder="Search..."
                groupByFields={ this.props.groupByFields } 
            /></div>;

            //        let logTable = itemRows === null ? <div>Nothing to show</div> : <table style={{ display: 'block'}} className={stylesInfo.infoTable}>

            let barText = this.props.blueBar && this.props.blueBar != null ? this.props.blueBar : <span>Items</span>;

            let webTitle = null;

            if ( barText != null ) {
                webTitle =<div className={ stylesInfo.infoHeading }><span style={{ paddingLeft: 20, whiteSpace: 'nowrap' }}>( { this.props.items.length }  ) Items in: { barText }</span></div>;

            
            /*stylesL.reactListView*/
            return (
                <div className={ '' } >
                    <div style={{ paddingTop: 10}} className={ stylesInfo.infoPaneTight }>
                    { webTitle }
                    { panel }
                    { listView }
                </div>
                </div>
                );

            } else {

            // <div className={ styles.container }></div>
            return (
                <div className={ styles.logListView }>
                    { thisLog }
                </div>
                );
            } 

        } //if ( this.props.items != null && this.props.items.length > 0 ) {    
    } // Render



    /***
 *         db    db d8888b. d8888b.  .d8b.  d888888b d88888b      .d8888. d888888b  .d8b.  d888888b d88888b 
 *         88    88 88  `8D 88  `8D d8' `8b `~~88~~' 88'          88'  YP `~~88~~' d8' `8b `~~88~~' 88'     
 *         88    88 88oodD' 88   88 88ooo88    88    88ooooo      `8bo.      88    88ooo88    88    88ooooo 
 *         88    88 88~~~   88   88 88~~~88    88    88~~~~~        `Y8b.    88    88~~~88    88    88~~~~~ 
 *         88b  d88 88      88  .8D 88   88    88    88.          db   8D    88    88   88    88    88.     
 *         ~Y8888P' 88      Y8888D' YP   YP    YP    Y88888P      `8888Y'    YP    YP   YP    YP    Y88888P 
 *                                                                                                          
 *                                                                                                          
 */

    private _updateStateOnPropsChange(): void {
//        this.setState({
//        });
    }

    //private _sampleOnClick = (item): void => {
    private _onShowPanel = (item): void => {
  
        //This sends back the correct pivot category which matches the category on the tile.
        let e: any = event;
        console.log('_onShowPanel: e',e);
        console.log('_onShowPanel item clicked:',item);

//        let panelItem : IDrillItemInfo = null;


        //Also need to udpate content
        if (item.length > 0 ) {
            let panelItem  : IDrillItemInfo = this._getItemFromId(this.props.items, 'Id', item[0].Id);
            this.setState({ 
                showPanel: true, 
                panelId: item[0].Id,
                panelItem: panelItem,
            });
        }


    }

    private _getItemFromId( items: IDrillItemInfo[], key: string, val: any ) {
        let panelItem : IDrillItemInfo =  null;
        let showIndex = doesObjectExistInArray(this.props.items, key, val);
        if (showIndex !== false ) {
            panelItem = this.props.items[showIndex];
            console.log('showPanelPropsItem', panelItem );
        }
        return panelItem;

    }

    private _onClosePanel = (): void => {
        this.setState({ showPanel: false });
      }

      /**
       * This was copied from codepen example code to render a footer with buttons:
       * https://fabricweb.z5.web.core.windows.net/oufr/6.50.2/#/examples/panel
       * 
       */
    private _onRenderFooterContent = (): JSX.Element => {
        return null;

        return (
        <div>
            <PrimaryButton onClick={this._onClosePanel} style={{ marginRight: '8px' }}>
            Save
            </PrimaryButton>
            <DefaultButton onClick={this._onClosePanel}>Cancel</DefaultButton>
        </div>
        );
    }

}

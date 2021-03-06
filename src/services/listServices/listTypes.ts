
/**
 * Ensures that the specified list exists in the collection (note: this method not supported for batching)
 *
 * @param title The new list's title
 * @param desc The new list's description
 * @param template The list template value
 * @param enableContentTypes If true content types will be allowed and enabled, otherwise they will be disallowed and not enabled
 * @param additionalSettings Will be passed as part of the list creation body or used to update an existing list
 */
// ensure(title: string, desc?: string, template?: number, enableContentTypes?: boolean, additionalSettings?: Partial<IListInfo>): Promise<IListEnsureResult>;

export function notify(statusLog, verb, status, step , f, returnField, checkValue = null, noAlert = false) {
    if ( f == null ) { f = {name:''} ; }
    let thisItem = f == null ? null : f.name ? f.name : f.Title;

    let thisNotify = {
        time: (new Date()).toLocaleString() ,  
        verb: verb,   
        //status: status,
        //checkValue: checkValue,
    };

    if ( step !== null && step !== undefined ) { thisNotify["step"] = step; }
    if ( status !== null && status !== undefined ) { thisNotify["status"] = status; }
    if ( thisItem !== null && thisItem !== undefined ) { thisNotify["item"] = thisItem; }
    if ( returnField !== null && returnField !== undefined ) { thisNotify["returnField"] = returnField; }
    if ( checkValue !== null && checkValue !== undefined ) { thisNotify["checkValue"] = checkValue; }

    //alert(verb + ' ' + f.name + ' ' + status );
    statusLog.push(thisNotify);

    return statusLog;
}

export function getXMLObjectFromString(str, tag, toText, removeTag = false) {
    // 2020-06-24:  Copied from Views_.aspx of Super Contents
    // Gets tag from an XML string like pulling "Fields" out of a view schema
    // toText will then also convertTagsToHTML for display on a page.

      var fullTag = "";
  
      if (str == null) {
        return "null viewQuery";
      }
  
      var tagLength = tag.length;
      var tag1 = "<" + tag;
      var tag2 = "</" + tag + ">";
      var IndexOf1 = str.indexOf(tag1);
      var IndexOf2 = str.indexOf(tag2);
  
      if (IndexOf1 > -1 && IndexOf1 > -1) {
        fullTag = str.substring(IndexOf1, IndexOf2 + tagLength + 3);
  
      }
  
      if (toText === true) { //Then convert <> to html valid
  
        fullTag = fullTag.replace(/[<]/g, "&lt;");
        fullTag = fullTag.replace(/[>]/g, "&gt;");
  
      }

      if (removeTag === true) { //Then convert <> to html valid
        fullTag = fullTag.slice(tagLength + 2, fullTag.length - (tagLength + 3));
      }

  
  
      return fullTag;
}

export interface IServiceLog {
    time: string;
    step: string;
    verb: string;
    status: string;
}

export interface IMyListInfo {
    webURL?: string;
    title: string;
    desc?: string;
    template?: number;
    enableContentTypes?: boolean;
    additionalSettings?: Partial<IListInfo>;
}

export interface IListInfo {
    EnableRequestSignOff: boolean;
    EnableVersioning: boolean;
    EntityTypeName: string;
    ExemptFromBlockDownloadOfNonViewableFiles: boolean;
    FileSavePostProcessingEnabled: boolean;
    ForceCheckout: boolean;
    HasExternalDataSource: boolean;
    Hidden: boolean;
    Id: string;
    ImagePath: {
        DecodedUrl: string;
    };
    ImageUrl: string;
    IrmEnabled: boolean;
    IrmExpire: boolean;
    IrmReject: boolean;
    IsApplicationList: boolean;
    IsCatalog: boolean;
    IsPrivate: boolean;
    ItemCount: number;
    LastItemDeletedDate: string;
    LastItemModifiedDate: string;
    LastItemUserModifiedDate: string;
    ListExperienceOptions: number;
    ListItemEntityTypeFullName: string;
    MajorVersionLimit: number;
    MajorWithMinorVersionsLimit: number;
    MultipleDataList: boolean;
    NoCrawl: boolean;
    ParentWebPath: {
        DecodedUrl: string;
    };
    ParentWebUrl: string;
    ParserDisabled: boolean;
    ServerTemplateCanCreateFolders: boolean;
    TemplateFeatureId: string;
    Title: string;
    UniquePerms?: boolean;

}

export interface IContentsLists {
  tabs: string[];
  lists: {
    all: IContentsListInfo[];
    searched: IContentsListInfo[];
//    hidden: IContentsListInfo[];
//    visible: IContentsListInfo[];
//    maxItems: IContentsListInfo[];
//    empty: IContentsListInfo[];
//    notEmpty: IContentsListInfo[];
//    noVersions: IContentsListInfo[];
//    infVersions: IContentsListInfo[];
  };
}

export interface IContentsListInfo {

  //Minimum Props
  //AllowContentTypes: boolean;
  ContentTypesEnabled: boolean;
  BaseTemplate: number;
  BaseType: number;

  EntityTypeName: string;   //"Projects83List"
  Title: string;
  Hidden: boolean;
  Id: string;
  Description: string;

  ItemCount: number;
  Created: string;
  LastItemDeletedDate: string;
  LastItemModifiedDate: string;
  LastItemUserModifiedDate: string;

  ParentWebPath: {
    DecodedUrl: string;
  };
  ParentWebUrl: string;

  //Versioning
  EnableRequestSignOff: boolean;
  EnableVersioning: boolean;
  MajorVersionLimit: number;
  MajorWithMinorVersionsLimit: number;
  DraftVersionVisibility: number;
  ForceCheckout: boolean;
  EnableModeration: boolean;

  //Advanced Settings
  ServerTemplateCanCreateFolders: boolean;
  EnableAttachments: boolean;
  NoCrawl: boolean;

  //Custom info
  UniquePerms?: boolean;
  searchString: string;
  modifiedAge?: number;
  createdAge?: number;
  meta?: string[];
  
  sort: string;
  bucketCategory: string;
  bucketLabel: string;
  bucketIdx: any;

  //Backend Info
  odataEtag: string; //""121""
  odataId: string; //odata.id: "https://mcclickster.sharepoint.com/sites/Templates/Testing/_api/Web/Lists(guid'd6f45bb5-57d9-436a-a62a-ac9bd2fbffec')"
  ListItemEntityTypeFullName: string;  //:  "SP.Data.Projects83ListItem"

  ImagePath: {
      DecodedUrl: string;
  };

  ImageUrl: string;
  IrmEnabled: boolean;
  IrmExpire: boolean;
  IrmReject: boolean;
  IsApplicationList: boolean;
  IsCatalog: boolean;
  IsPrivate: boolean;

  TemplateFeatureId: string;

  //Unknown Props
  HasExternalDataSource: boolean;
  ExemptFromBlockDownloadOfNonViewableFiles?: boolean;
  FileSavePostProcessingEnabled?: boolean;
  ParserDisabled: boolean;

  ListExperienceOptions: number;
  MultipleDataList: boolean;



}
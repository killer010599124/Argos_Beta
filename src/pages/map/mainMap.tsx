import React from "react";
import { useRef, useState, ChangeEvent } from "react";
import { useEffect } from "react";
import { useMap } from "./useMap";
import assets from "../../assets";
import "./style.css";
import Tab from "@mui/material/Tab/Tab";
import { Box, Tabs } from "@mui/material";
import PDLJSClient from "./utils/PDL";
import jsPDF from "jspdf";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { CollectionReference, collection } from "firebase/firestore";
import * as firebase from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import MapAlertMessage from "../../components/common/mapAlertMessage";


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}


//------------------------------------ ******************** Tab Control *********************--------------------------//


function TabPanel_Draw(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}
function tabProps_Draw(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function TabPanel_PB(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="TabPanel_PB"
      hidden={value !== index}
      id={`simple-tabpanel_pb-${index}`}
      aria-labelledby={`simple-tab_pb-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}
function tapProps_PB(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel_pb-${index}`,
  };
}

function TabPanel_DV(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="TabPanel_DV"
      hidden={value !== index}
      id={`simple-tabpanel_dv-${index}`}
      aria-labelledby={`simple-tab_dv-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}
function tabProps_DV(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel_dv-${index}`,
  };
}

//----------------------********* Define Variable To Save Working Data in Firebase when leave broswer **********-------------------

var blobg: string | Blob;
var blobl: string | Blob;
var blobt: string | Blob;

blobg = "";
blobl = "";
blobt = "";

//-----------------------  Main --------------------//

const SatelitteMap = (context: any) => {

  //---------******* Define Map *******---------\\

  const mapRef = useRef<HTMLDivElement>(null);

  //---------******** FireBase Config *********-----------\\

  const auth = getAuth();
  const userId = auth.currentUser?.uid ?? "";
  const storage = getStorage();

  //---------******** Left Side Button Visible Control ********----------\\

  const [dataVisible, setDataVisible] = useState(1);
  const [layerVisible, setLayerVisible] = useState(1);
  const [drawToolVisible, setDrawToolVisible] = useState(1);
  const [pbVisible, setPbVisible] = useState(1);


  //------------*********  All Tab UI Controller *********-------------------\\

  const [value_tab_draw, setValue_tab_draw] = React.useState(0);
  const [value_tab_pb, setValue_tab_pb] = React.useState(0);
  const [value_tab_dv, setValue_tab_dv] = React.useState(0);
  const [value_tab_layer, setValue_tab_layer] = React.useState(0);

  const handleTabDrawChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setValue_tab_draw(newValue);
  };
  const handleTabPBChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue_tab_pb(newValue);
  };
  const handleTabDVChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue_tab_dv(newValue);
  };
  const handleTabLayerChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setValue_tab_layer(newValue);
  };

  //-------------***************  Page Visual Elements Setting *************---------------\\

  const [alertContent, setAlertContent] = useState("");
  const [alertColor, setAlertColor] = useState("");
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  //-------------****************** Draw Mode Setting **************--------------------\\

  const [drawMode, setDrawMode] = useState("");
  const [drawEnable, setDrawEnable] = useState(false);

  //---------------************ Download PDF for People and Complan Data *************\\
  const handleGeneratePdf = () => {
    const pdf = new jsPDF("p", "mm", [1000, 750]);

    // Adding the fonts.
    pdf.setFont("Inter-Regular", "normal");

    const input = document.getElementsByClassName("PBData")[0];
    const el1: HTMLElement = input as HTMLElement;
    el1.style.color = "black";

    pdf.html(el1, {
      async callback(pdf) {
        pdf.save("report.pdf");
        el1.style.color = "white";
      },
    });
  };

  //----------------************** May Style Setting *************-------------------\\
  const [geoStyleName, setGeoStyleName] = useState(
    "mapbox://styles/mapbox/satellite-streets-v12"
  );
  //---------------******** When Import Data,, it shows on the map -------------------\\
  const [addDataLayerController, setAddDataLayerController] = useState(true);


  //------------------********* Importing GeoData From CSV file **********------------\\

  const csv2geojson = require("csv2geojson");
  const readFile = require("./utils/readCsvFile");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeader, setCsvHeader] = useState<string[]>([]);
  const manageCsvData = (data: any) => {
    setCsvData((prevNames) => [...prevNames, data]);
  };

  const readCSVFile = (e: any) => {
    const file = e.target.files[0];
    setLoading(true);
    setLoadingText("Loading CSV Data");
    readFile.readAsText(file, (err: any, text: any) => {
      csv2geojson.csv2geojson(
        text,
        {
          delimiter: "auto",
        },
        (err: any, result: any) => {
          if (err) {
            setLoading(false);
          } else {
            setGeodata([]);
            setGeodata(result);

            setCsvData([]);

            const cheader = Object.keys(result.features[0].properties);
            setCsvHeader(cheader);

            // const array = result.features.map((i: any, index: number) => {
            //   const values = i.properties;
            //   const obj = cheader.reduce((object: any, header, index) => {
            //     object[header] = values[header];
            //     return object;
            //   }, {});
            // });
            setLoading(false);
          }
        }
      );
    });
  };

  //---------------------************* Geo Data Input Mode(CSV or Manual) ***********--------------\\
  const [inputMode, setInputMode] = useState<string>("csv");

  //------------------  **************  Data Manager   ************** ---------------\\

  const [geodata, setGeodata] = useState<any>(); // Geodata when we input

  const [allGeodata, setAllGeodata] = useState<any[]>([]); // All geoData json on the map.

  const [currentLayerData, setCurrentLayerData] = useState<any[]>([]); // GeoData of currently selected layer

  const [currentLayerDataHeader, setCurrentLayerDataHeader] = useState<string[]>([]); // Key Field of currently selected layer GeoData

  const [allTableData, setAllTableData] = useState<any[]>([]);

  const [currentMarkerData, setCurrentMarkerData] = useState<{ data: any; id: number; }>(); // Get current selected a point data of layer.

  const [initFlag, setInitFlag] = useState(false); // When open page,,, load data. send signal from UI to map controller

  //-------------------------*************** Data Table UI Controller *******************--------------------//

  const [boxWidth, setBoxWidth] = useState(400);
  const [boxHeight, setBoxHeight] = useState(800);
  const [isResizing, setIsResizing] = useState(false);
  const [draggable, setDraggable] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 84 });
  const handleDrag = (event: DraggableEvent, data: DraggableData) => {
    setPosition({ x: data.x, y: data.y });
  };

  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMouseDown = (event: any) => {
    const cornerWidth = 20; // set the width of the corner area
    const cornerHeight = 20; // set the height of the corner area

    const isCornerClicked =
      event.clientX > boxWidth - cornerWidth &&
      event.clientY > boxHeight - cornerHeight;
    if (isCornerClicked) {
      setIsResizing(true);
      setDraggable(true);
      setStartX(event.clientX);
      setStartY(event.clientY);
    } else {
      setIsResizing(false);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setDraggable(false);
  };

  const handleMouseMove = (event: any) => {
    if (isResizing) {
      setDraggable(true);
      const newWidth = Math.max(50, boxWidth + event.clientX - startX);
      const newHeight = Math.max(50, boxHeight + event.clientY - startY);
      setBoxWidth(newWidth);
      setBoxHeight(newHeight);
      setStartX(event.clientX);
      setStartY(event.clientY);
    }
  };

  //-----------------------********************** Data Table Pagination Controller **********************-------------------\\
  const rowsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageData, setCurrentPageData] = useState<any>([]);
  function getNumPages(rows: any[]): number {
    // Calculate the total number of pages based on the total number of rows and the rows per page
    return Math.ceil(rows.length / rowsPerPage);
  }
  function nextPage(): void {
    if (currentPage < getNumPages(currentLayerData)) {
      setCurrentPage(currentPage + 1);
    }
  }
  function prevPage(): void {
    // Show the previous page of data
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }
  function showTable(temp: any) {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, temp.length);

    // Retrieve the relevant rows from the data source
    const pageRows = temp.slice(startIndex, endIndex);
    setCurrentPageData(pageRows);
  }
  useEffect(() => {
    showTable(currentLayerData);
  }, [currentPage])

  useEffect(() => {
    showTable(currentLayerData);
  }, [currentLayerData])


  //-------------------------****************** Left SideBar Setting UI Controller *******************--------------------//

  const [draggablePositionData, setDraggablePositionData] = useState({ x: 0, y: 84 });
  const handleDragData = (event: DraggableEvent, data: DraggableData) => {
    setDraggablePositionData({ x: data.x, y: data.y });
  };

  //-------------- ******************* Manage Layers ********************---------------//

  const [layer, setLayer] = useState(""); //  layer name when we import from Data setting Panel.
  const [currentLayerName, setCurrentLayerName] = useState(""); // layer name that be selected currently
  const [dataLayers, setDataLayers] = useState<string[]>([]);  // All existing Layers name in workspace
  const [dataLayersVisible, setDataLayersVisible] = useState<any[]>([]); // Set visibility of all layers on the map

  const addDataLayer = () => {
    const checkStringExistence = (array: string[], value: string): boolean => {
      return array.includes(value);
    };
    const isStringExists = checkStringExistence(dataLayers, layer);

    if (layer === "") {
      setAlertVisible(true);
      setAlertColor("black");
      setAlertContent("You should enter a layer name ");
    } else if (isStringExists) {
      setAlertVisible(true);
      setAlertColor("black");
      setAlertContent("Layer name is already exist. Enter a other name");
    } else if (!geodata) {
      setAlertVisible(true);
      setAlertColor("black");
      setAlertContent("You need to import data or create.");
    } else {
      setLoading(true);
      setLoadingText("Loading CSV Data");
      setLayerImageFiles((prevNames) => [...prevNames, selectedLayerImageFile]);
      setMarkerImageFiles((prevNames) => [
        ...prevNames,
        { data: selectedMarkerImageFile, layername: layer },
      ]);
      // setCurrentMarkerImage({ data:selectedMarkerImageFile, layername:layer});

      if (inputMode === "csv") {
        setDataLayers((layers) => [...layers, layer]);
        setDataLayersVisible((layers) => [
          ...layers,
          { layerName: layer, visible: true },
        ]);

        setAddDataLayerController(!addDataLayerController);
        if (geodata) {
          const temp = { name: layer, data: geodata };
          setAllGeodata((prevNames) => [...prevNames, temp]);
        }
        setCurrentLayerName(layer);
      } else if (inputMode === "manual") {
        setDataLayers((layers) => [...layers, layer]);
        setDataLayersVisible((layers) => [
          ...layers,
          { layerName: layer, visible: true },
        ]);

        setCurrentLayerName(layer);
        setAddDataLayerController(!addDataLayerController);
        if (geodata) {
          const temp = { name: layer, data: geodata };
          setAllGeodata((prevNames) => [...prevNames, temp]);
        }
      }
    }
  };

  function removeDataLayer() {
    console.log(mCurrentLayer);
    if (mCurrentLayer) {
      const indexToRemove = dataLayers.indexOf(mCurrentLayer);
      const updatedArray = [
        ...dataLayers.slice(0, indexToRemove),
        ...dataLayers.slice(indexToRemove + 1),
      ];
      setDataLayers(updatedArray);

      const updatedArrayVisible = [
        ...dataLayersVisible.slice(0, indexToRemove),
        ...dataLayersVisible.slice(indexToRemove + 1),
      ];
      setDataLayersVisible(updatedArrayVisible);

      const updatedGeo = allGeodata.filter((obj) => obj.name !== mCurrentLayer);
      setAllGeodata(updatedGeo);

      const updatedTable = allTableData.filter(
        (obj) => obj.name !== mCurrentLayer
      );
      setAllTableData(updatedTable);

      const gjson = JSON.stringify(updatedGeo, null, 2);
      const ljson = JSON.stringify(updatedArray, null, 2);
      const tjson = JSON.stringify(updatedTable, null, 2);

      blobg = new Blob([gjson], { type: "application/json" });
      blobl = new Blob([ljson], { type: "application/json" });
      blobt = new Blob([tjson], { type: "application/json" });
    }
  }

  //------------------**************** Manual Data Import Setting ******************--------------------\\

  const [mCurrentLayer, setMCurrentLayer] = useState<string>(); // current Layer in Data Setting Panel, we will use this to remove layers.
  const [mNewFieldData, setMNewFieldData] = useState<string[]>([]);
  const [acceptField, setAcceptField] = useState(false);
  const [fieldName, setFieldName] = useState<string>();
  const handlFieldName = (str: string) => {
    setFieldName(str);
  };
  const addFieldName = () => {
    if (fieldName) {
      setMNewFieldData((prevNames) => [...prevNames, fieldName]);
    }
  };
  const acceptDataField = () => {
    interface MyObject {
      [key: string]: string;
    }

    setAcceptField(true);

    const myObject: MyObject = {};
    mNewFieldData.forEach((str) => {
      const [key, value] = str.split(":");
      myObject[key] = "Empty";
    });

    const features = [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [45, 45],
        },
        properties: myObject,
      },
      // Add more features as needed
    ];
    const geojson = {
      type: "FeatureCollection",
      features: features,
    };
    setGeodata([]);
    setGeodata(geojson);

    setCsvData([]);

    const cheader = Object.keys(geojson.features[0].properties);
    setCsvHeader(cheader);

    const array = geojson.features.map((i: any) => {
      const values = i.properties;
      const obj = cheader.reduce((object: any, header, index) => {
        object[header] = values[header];
        return object;
      }, {});
      return obj;
    });
  };


  //----------------------******************** Marker Image Control **********************-------------------\\

  const [selectedLayerImageFile, setSelectedLayerImageFile] = useState<string | null>(null);
  const [layerImageFiles, setLayerImageFiles] = useState<any[]>([]);

  const [selectedMarkerImageFile, setSelectedMarkerImageFile] = useState<string | null>(null);
  const [markerImageFiles, setMarkerImageFiles] = useState<any[]>([]);
  const [currentMarkerImage, setCurrentMarkerImage] = useState<any>();

  const handleLayerImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedLayerImageFile(reader.result as string);
      };
      reader.readAsDataURL(fileList[0]);
    }
  };
  const handleMarkerImageFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedMarkerImageFile(reader.result as string);
      };
      reader.readAsDataURL(fileList[0]);
    }
  };


  //--------**************   Person search engine  ***************-----------//

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [content, setContent] = useState("");
  const [pSearchCount, setPSearchCount] = useState(0);
  const [searchPeopleData, setSearchPeopleData] = useState<any[]>([]);

  const [pid, setPid] = useState("");
  const [pname, setPName] = useState("");
  const [paddress, setPaddress] = useState("");
  const [pemail, setPemail] = useState("");
  const [pphone, setPphone] = useState("");

  const [pfacebook_id, setPfacebook_id] = useState("");
  const [pfacebook_url, setPfacebook_url] = useState("");
  const [pfacebook_un, setPfacebook_un] = useState("");

  const [plinkdin_id, setPlinkdin_id] = useState("");
  const [plinkdin_url, setPlinkdin_url] = useState("");
  const [plinkdin_un, setPlinkdin_un] = useState("");

  const [ptwitter_url, setPtwitter_url] = useState("");
  const [ptwitter_un, setPtwitter_un] = useState("");

  const [pbMode, setPbMode] = useState("person");


  //-------*****************------------------ Company Search Engine ---------***************---------//

  const [cName, setCName] = useState("");
  const [cWebsite, setCWebsite] = useState("");
  const [cticker, setCticker] = useState("");
  const [cSearchCount, setCSearchCount] = useState(0);
  const [searchCompanyData, setSearchCompanyData] = useState<any[]>([]);

  const [bid, setBid] = useState("");
  const [bname, setBname] = useState("");
  const [bfounded, setBfounded] = useState<number>();
  const [bindustry, setBindustry] = useState("");
  const [bwebsite, setBwebsite] = useState("");
  const [bsummary, setBsummary] = useState("");

  const [blinkdin, setBlinkdin] = useState("");
  const [bfacebook, setBfacebook] = useState("");
  const [btwitter, setBtwitter] = useState("");
  const [bcrunchbase, setCrunchbase] = useState("");

  //-------------------- ***************** People and Company Search Functions ******************-----------------\\

  function makePersonQuery(
    first_name: string,
    last_name: string,
    address: string,
    email: string,
    phone: string
  ) {
    var query = "SELECT * FROM person WHERE ";
    if (first_name == "") {
      query += "";
    } else {
      query += `first_name = '${first_name}' `;
    }

    if (last_name == "") {
      query += "";
    } else {
      query += `AND last_name = '${last_name}' `;
    }

    if (email == "") {
      query += "";
    } else {
      query += `AND personal_emails = '${email}' `;
    }

    if (phone == "") {
      query += "";
    } else {
      query += `AND phone_numbers = '${phone}' `;
    }

    if (address == "") {
      query += "";
    } else {
      query += `AND location_street_address = '${address}' `;
    }
    query = query.replace("WHERE AND", "WHERE");
    return query;
  }
  function makeCompanyQuery(name: string, ticker: string, website: string) {
    var query = "SELECT * FROM company WHERE ";

    if (name == "") {
      query += "";
    } else {
      query += `name = '${name}' `;
    }

    if (ticker == "") {
      query += "";
    } else {
      query += `AND ticker = '${ticker}' `;
    }

    if (website == "") {
      query += "";
    } else {
      query += `AND website = '${website}' `;
    }
    query = query.replace("WHERE AND", "WHERE");
    return query;
  }

  const clearPersonData = () => {
    setPid("");
    setPName("");
    setPaddress("");
    setPemail("");
    setPphone("");
    setPfacebook_id("");
    setPfacebook_url("");
    setPfacebook_un("");

    setPlinkdin_id("");
    setPlinkdin_url("");
    setPlinkdin_un("");

    setPtwitter_url("");
    setPtwitter_un("");
  };
  const getPersonData = () => {
    clearPersonData();
    const query = makePersonQuery(
      firstName,
      lastName,
      address,
      email,
      phoneNumber
    );
    PDLJSClient.person.search
      .sql({
        searchQuery: query,
        size: 5,
      })
      .then((data) => {
        setPSearchCount(data["total"]);
        setSearchPeopleData([]);
        setSearchPeopleData(data["data"]);
      })
      .catch((error) => {
        setPSearchCount(0);
        setSearchPeopleData([]);
        clearPersonData();
        console.log(error);
      });
  };
  const displayPeopleData = (data: any) => {
    setPid("" + data["id"]);
    setPName("" + data["full_name"]);
    setPaddress("" + data["location_street_address"]);
    setPemail("" + data["personal_emails"]);
    setPphone("" + data["phone_numbers"]);
    setPfacebook_id("" + data["facebook_id"]);
    setPfacebook_url("" + data["facebook_url"]);
    setPfacebook_un("" + data["facebook_username"]);

    setPlinkdin_id("" + data["linkedin_id"]);
    setPlinkdin_url("" + data["linkedin_url"]);
    setPlinkdin_un("" + data["linkedin_username"]);

    setPtwitter_url("" + data["twitter_url"]);
    setPtwitter_un("" + data["twitter_username"]);

    // setIsSearchResult(true);
  };
  const clearCompanyData = () => {
    setBid("");
    setBname("");
    setBfounded(0);
    setBindustry("");
    setBwebsite("");
    setBsummary("");

    setBlinkdin("");
    setBfacebook("");
    setBtwitter("");
    setCrunchbase("");
  };
  const getCompanyData = (ticker: string, name: string, website: string) => {
    clearCompanyData();
    const query = makeCompanyQuery(name, ticker, website);
    PDLJSClient.company.search
      .sql({
        searchQuery: query,
        size: 5,
      })
      .then((data) => {
        setCSearchCount(data["total"]);
        setSearchCompanyData(data.data);
      })
      .catch((error) => {
        setCSearchCount(0);
        clearCompanyData();
        console.log(error);
      });
  };
  const displayCompanyData = (data: any) => {
    setBid(data.id as string);
    setBname(data.name as string);
    setBfounded(data.founded as number);
    setBindustry(data.industry as string);
    setBwebsite(data.website as string);
    setBsummary(data.summary as string);

    setBlinkdin(data.linkedin_url as string);
    setBfacebook(data.facebook_url as string);
    setBtwitter(data.twitter_url as string);
    setCrunchbase(data.profiles?.at(4) as string);
  };




  //-----------------************ Update blog data to store layers & geoData in firebase  and then set current layer data **************-------------------\\

  function checkNewTableData(data: any, name: string) {
    if (data.length != 0) {
      let cnt = 0;
      data.map((d: any, index: number) => {
        if (d.name === name) {
          cnt++;
        }
      });

      if (cnt == 0) {
        return false;
      } else {
        return true;
      }
      // return false;
    } else {
      return false;
    }
  }
  useEffect(() => {
    if (currentLayerName) {
      markerImageFiles.map((data, index) => {
        if (data.layername === currentLayerName)
          setCurrentMarkerImage(data.data);
      });

      const gjson = JSON.stringify(allGeodata, null, 2);
      const ljson = JSON.stringify(dataLayers, null, 2);

      blobg = new Blob([gjson], { type: "application/json" });
      blobl = new Blob([ljson], { type: "application/json" });

      // saveAs(blobg, `geo${userId}.json`);
      // saveAs(blobl, `layer${userId}.json`);
      setCurrentPage(1);
      if (checkNewTableData(allTableData, currentLayerName)) {
        allTableData.map((data: any, index: number) => {
          if (data.name === currentLayerName) {
            setCurrentLayerDataHeader(data.header);
            setCurrentLayerData(data.data);
            setLoading(false);
          }
        });
      } else {
        allGeodata.map((data, index) => {
          if (data.name === currentLayerName) {
            const cheader = Object.keys(data.data.features[0].properties);
            setCurrentLayerDataHeader(cheader);
            setCurrentLayerData([]);
            // setCurrentLayerData(geoJsonFeatureToTableRows(data.data.features));
            const array = data.data.features.map((i: any, index: number) => {
              const values = i.properties;
              const obj = cheader.reduce((object: any, header, index) => {
                object[header] = values[header];
                return object;
              }, {});

              setCurrentLayerData((prevNames) => [...prevNames, obj]);
            });
            setLoading(false);
          }
        });
      }
      // showTable(currentLayerData)
    }
  }, [currentLayerName]);


  //----------------******** Update Table Data after loading ********-----------------\\
  useEffect(() => {
    if (loading == false) {
      if (currentLayerData.length != 0) {
        const isDataExists = allTableData.some(
          (data) => data.name === currentLayerName
        );
        if (!isDataExists) {
          let tempTableData = allTableData;
          tempTableData.push({
            data: currentLayerData,
            header: currentLayerDataHeader,
            name: currentLayerName,
          });

          setAllTableData(tempTableData);
        }
      }
    }
  }, [loading]);

  //-----------------********* Store All table Data to Blob whenever it updated ***********--------------\\
  useEffect(() => {
    if (allTableData) {
      if (allTableData.length != 0) {
        // localStorage.setItem("tableData", JSON.stringify(allTableData));

        const jsonContent = JSON.stringify(allTableData, null, 2);
        blobt = new Blob([jsonContent], { type: "application/json" });
      }
    }
  }, [allTableData]);
  //--------------------*************** Loading Data when open workspace **************-------------------\\
  useEffect(() => {
    // set action to be performed when component unmounts
    loadWorkSpace();
    return () => {
      blobg = "";
      blobt = "";
      blobl = "";
    };
  }, []);

  const saveWorkspace = async () => {
    // if (blobg != "" && blobl != "" && blobt != "") {
    setLoading(true);
    setLoadingText("Saving Workspace");

    const gjson = JSON.stringify(allGeodata, null, 2);
    const ljson = JSON.stringify(dataLayers, null, 2);
    const tjson = JSON.stringify(allTableData, null, 2);

    blobg = new Blob([gjson], { type: "application/json" });
    blobl = new Blob([ljson], { type: "application/json" });
    blobt = new Blob([tjson], { type: "application/json" });

    const geoRef = ref(storage, `${userId}/geo.json`);
    const layerRef = ref(storage, `${userId}/layer.json`);
    const tableRef = ref(storage, `${userId}/table.json`);

    await uploadBytes(geoRef, blobg as Blob).then((snapshot) => {
      console.log("Uploaded an array!");
      console.log(snapshot);
    });
    await uploadBytes(layerRef, blobl as Blob).then((snapshot) => {
      console.log("Uploaded an array!");
    });
    await uploadBytes(tableRef, blobt as Blob).then((snapshot) => {
      console.log("Uploaded an array!");
    });
    setLoading(false);
    console.log("BLOB");
    blobg = "";
    blobt = "";
    blobl = "";
    // }
  };
  async function loadWorkSpace() {
    // const docRef = doc(db, "data", userId);
    // const docSnap = getDoc(docRef);
    setAddDataLayerController(!addDataLayerController);
    setLoading(true);
    setLoadingText("Loading Workspace");

    const geoRef = ref(storage, `${userId}/geo.json`);
    const layerRef = ref(storage, `${userId}/layer.json`);
    const tableRef = ref(storage, `${userId}/table.json`);

    if (geoRef && layerRef && tableRef) {
      await getDownloadURL(geoRef)
        .then((url) => {
          fetch(url)
            .then((response) => response.json())
            .then((jsonData) => {
              setAllGeodata(jsonData);
              setInitFlag(!initFlag);
            })
            .catch((error) => {
              console.error("Error retrieving JSON data", error);
            });
        })
        .catch((error) => {
          console.log(error);
          // Handle any errors
        });

      await getDownloadURL(tableRef)
        .then((url) => {
          fetch(url)
            .then((response) => response.json())
            .then((jsonData) => {
              setAllTableData(jsonData);
            })
            .catch((error) => {
              console.error("Error retrieving JSON data", error);
            });
        })
        .catch((error) => {
          console.log(error);
          // Handle any errors
        });

      await getDownloadURL(layerRef)
        .then((url) => {
          fetch(url)
            .then((response) => response.json())
            .then((jsonData) => {
              const updatedArray = jsonData.map((obj: any) => ({
                layerName: obj,
                visible: true,
              }));
              setDataLayersVisible(updatedArray);

              setDataLayers(jsonData);
              setCurrentLayerName(jsonData[0]);
            })
            .catch((error) => {
              console.error("Error retrieving JSON data", error);
            });
        })
        .catch((error) => {
          console.log(error);
          // Handle any errors
        });
    }
    setLoading(false);
    localStorage.clear();
  }


  //---------------------*************** CRUD a point of current layer data from map. ****************-------------------\\

  const addCurrentLayerData = (aData: any) => {
    const feature = {
      type: "Feature",
      geometry: aData.geometry,
      properties: aData.properties,
    };
    let temp = currentLayerData;
    console.log("0-", temp);
    temp.push(aData.properties);
    setCurrentLayerData(temp);

    const updateTableData = allTableData.map((obj: any, index: number) => {
      // 👇️ if id equals 2, update country property
      if (obj.name === currentLayerName) {
        return {
          data: temp,
          header: currentLayerDataHeader,
          name: currentLayerName,
        };
      }
      // 👇️ otherwise return the object as is
      return obj;
    });

    setAllTableData(updateTableData);
  };

  const updateCurrentLayerData = (uData: any) => {
    // setCurrentMarkerData(uData);

    let temp = currentLayerData;

    temp[uData.id] = uData.data;
    console.log("1-", temp);
    setCurrentLayerData(temp);

    showTable(temp);

    const updateTableData = allTableData.map((obj: any, index: number) => {
      // 👇️ if id equals 2, update country property
      if (obj.name === currentLayerName) {
        return {
          data: temp,
          header: currentLayerDataHeader,
          name: currentLayerName,
        };
      }
      // 👇️ otherwise return the object as is
      return obj;
    });

    setAllTableData(updateTableData);
  };

  const deleteCurrentLayerData = (index: number) => {
    let temp = currentLayerData;
    temp.splice(index, 1);
    setCurrentLayerData(temp);

    showTable(temp);

    const updateTableData = allTableData.map((obj: any, index: number) => {
      // 👇️ if id equals 2, update country property
      if (obj.name === currentLayerName) {
        return {
          data: temp,
          header: currentLayerDataHeader,
          name: currentLayerName,
        };
      }
      // 👇️ otherwise return the object as is
      return obj;
    });

    setAllTableData(updateTableData);
  };

  //--------------------****************** Connect UI to Map *******************----------------------------\\
  const myMap = useMap(
    mapRef,
    addDataLayerController,
    initFlag,
    addCurrentLayerData,
    updateCurrentLayerData,
    deleteCurrentLayerData,
    geoStyleName,
    layer,
    currentLayerName,
    geodata,
    allGeodata,
    drawMode,
    selectedMarkerImageFile,
    currentMarkerImage,
    dataLayersVisible
  );

  return (
    <>
      {/* --------------------------- Side Tool Bar --------------------------- */}

      <MapAlertMessage
        message={alertContent}
        visible={alertVisible}
        color={alertColor}
        onClose={() => {
          setAlertVisible(false)
        }}
      />
      <div
        style={{
          position: "absolute",
          marginTop: "45%",
          marginLeft: "45%",
          zIndex: 9,
        }}
      >
        <button
          className="saveBtn"
          onClick={() => {
            saveWorkspace();
          }}
        >
          Save Workspace
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          marginTop: "6%",
          marginLeft: "2%",
          zIndex: "1",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          className="toolButton"
          onClick={() => {
            if (layerVisible) setLayerVisible(0);
            else setLayerVisible(1);
          }}
        >
          Layer
        </button>
        <button
          className="toolButton"
          onClick={() => {
            if (dataVisible) setDataVisible(0);
            else setDataVisible(1);
          }}
        >
          Data
          {/* <img src={assets.images.data} style={{ width: "60%", height: "60%" }} /> */}
        </button>

        <button
          className="toolButton"
          onClick={() => {
            if (drawToolVisible) {
              setDrawToolVisible(0);
              setDrawEnable(true)
            }
            else {
              setDrawToolVisible(1);
              setDrawEnable(false)
            }
          }}
        >
          Draw
        </button>
        <button
          className="toolButton"
          onClick={() => {
            if (pbVisible) setPbVisible(0);
            else setPbVisible(1);
          }}
        >
          P&B
        </button>
        <button
          className="toolButton"
          onClick={() => {
            if (pbVisible) setPbVisible(0);
            else setPbVisible(1);
          }}
        >
          TG
        </button>
      </div>

      {/* ----------------------------Basic Map Style layout --------------------- */}

      <div
        style={
          layerVisible
            ? { display: "none" }
            : {
              position: "absolute",
              marginTop: "7.5%",
              marginLeft: "5%",
              zIndex: "2",
              opacity: "0.75",
              background: "transparent",
              padding: "8px",
              borderRadius: "20px",
            }
        }
      >
        <button
          className="geoStyleBtn"
          onClick={() => setGeoStyleName("mapbox://styles/mapbox/light-v11")}
        >
          Light
        </button>
        <button
          className="geoStyleBtn"
          onClick={() => setGeoStyleName("mapbox://styles/mapbox/dark-v11")}
        >
          Dark
        </button>
        <button
          className="geoStyleBtn"
          onClick={() => setGeoStyleName("mapbox://styles/mapbox/streets-v12")}
        >
          Street
        </button>
        <button
          className="geoStyleBtn"
          onClick={() =>
            setGeoStyleName("mapbox://styles/mapbox/satellite-streets-v12")
          }
        >
          Satelitte
        </button>
      </div>

      {/* ----------------------Draw Geofence tool layout ---------------------- */}

      <div
        style={
          drawToolVisible
            ? { display: "none" }
            : {
              position: "absolute",
              marginTop: "11.7%",
              marginLeft: "5%",
              zIndex: "2",
              opacity: "0.75",
              width: "13.5%",
              background: "black",
              padding: "8px",
              height: "300px",
              borderRadius: "10px",
              justifyContent: "space-between",
              display: "flex",
            }
        }
      >
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value_tab_draw}
              onChange={handleTabDrawChange}
              aria-label="basic tabs example"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Tab
                label="Rect"
                {...tabProps_Draw(0)}
                style={{ color: "white", minWidth: "0px" }}
                onClick={() => {
                  if (drawEnable)
                    setDrawMode("RECT");
                }}
              />
              <Tab
                label="Circle"
                {...tabProps_Draw(1)}
                style={{ color: "white", minWidth: "0px" }}
                onClick={() => {
                  if (drawEnable)
                    setDrawMode("Circle");
                }}
              />
              <Tab
                label="poly"
                {...tabProps_Draw(2)}
                style={{ color: "white", minWidth: "0px" }}
                onClick={() => {
                  if (drawEnable)
                    setDrawMode("Polygon");
                }}
              />
            </Tabs>
          </Box>
          <TabPanel_Draw value={value_tab_draw} index={0}>
            <div className="drawTab">
              <div style={{ paddingBottom: "10px" }}>Properties</div>

              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  placeholder="point"
                  style={{ borderColor: "white", width: "100%" }}
                />
              </div>
              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  placeholder="width"
                  style={{ borderColor: "white", width: "100%" }}
                />
              </div>
              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  placeholder="height"
                  style={{ borderColor: "white", width: "100%" }}
                />
              </div>
            </div>
          </TabPanel_Draw>
          <TabPanel_Draw value={value_tab_draw} index={1}>
            <div className="drawTab">
              <div style={{ paddingBottom: "10px" }}>Properties</div>
              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  placeholder="point"
                  style={{ borderColor: "white", width: "100%" }}
                />
              </div>
              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  placeholder="radius"
                  style={{ borderColor: "white", width: "100%" }}
                />
              </div>
            </div>
          </TabPanel_Draw>
          <TabPanel_Draw value={value_tab_draw} index={2}>
            <div className="drawTab">
              <div style={{ paddingBottom: "10px" }}>Properties</div>
              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  placeholder="count"
                  style={{ borderColor: "white", width: "100%" }}
                />
              </div>
              <div style={{ display: "flex" }}>
                <textarea
                  placeholder="polygon vertex (X,Y) coordinate"
                  style={{
                    borderColor: "white",
                    height: "85px",
                    width: "100%",
                  }}
                />
              </div>
            </div>
          </TabPanel_Draw>
          <button className="geoStyleBtn" style={{ marginLeft: "20px" }}>
            Search
          </button>
        </Box>
      </div>

      {/* ---------------------------Point Data layout ----------------------- */}
      <Draggable position={position} onDrag={handleDrag} disabled={draggable}>
        <div
          style={{
            position: "fixed",
            right: "0%",
            // top: "0%",
            zIndex: "1",
            width: boxWidth,
            height: isMinimized ? 0 : boxHeight,
            // height: "64%",
            opacity: 0.75,
            background: "black",
            transition: "height 0.5s ease",
          }}
        >
          <div>
            <button
              style={{
                position: "absolute",
                width: "40px",
                height: "30px",
                marginLeft: "-40px",
                top: "50%",
                background: "black",
                opacity: "0.75",
                color: "white",
              }}
              onClick={toggleMinimized}
            >
              {isMinimized ? "show" : "hide"}
            </button>
          </div>
          <Box
            sx={{ width: "100%" }}
            style={{
              display: isMinimized ? "none" : "block",
              height: isMinimized ? 0 : boxHeight,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value_tab_dv}
                onChange={handleTabDVChange}
                aria-label="basic tabs example"
              >
                <Tab
                  label="Layer"
                  {...tabProps_DV(0)}
                  style={{ color: "white", width: "50%" }}
                  onClick={() => {
                  }}
                />
                <Tab
                  label="Data"
                  {...tabProps_DV(1)}
                  style={{ color: "white", width: "50%" }}
                  onClick={() => {
                  }}
                />
              </Tabs>
            </Box>
            <TabPanel_DV value={value_tab_dv} index={0}>
              <List
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  bgcolor: "background.paper",
                }}
                style={{
                  background: "black",
                  padding: "7%",
                  maxWidth: "100%",
                }}
              >
                {dataLayers.map((data, index) => {
                  return (
                    <ListItem
                      alignItems="flex-start"
                      onClick={() => setCurrentLayerName(data)}
                      className={`list-item ${currentLayerName == data && "active"
                        }`}
                      style={{
                        textAlign: "center",
                        alignItems: "center",
                        color: "white",
                      }}
                    >
                      <ListItemAvatar>
                        {selectedLayerImageFile && (
                          <Avatar
                            style={{
                              width: "100%",
                              height: "120px",
                              borderRadius: "10px",
                            }}
                            alt="Remy Sharp"
                            src={layerImageFiles[index]}
                          />
                        )}
                      </ListItemAvatar>
                      <ListItemText
                        style={{ marginLeft: "15px" }}
                        primary={data}
                      />
                      {dataLayersVisible.find((obj) => obj.layerName === data)
                        .visible ? (
                        <FaEyeSlash
                          onClick={() => {
                            setDataLayersVisible((prevObjects) => {
                              const updatedObjects = prevObjects.map((obj) => {
                                if (obj.layerName === data) {
                                  return {
                                    ...obj,
                                    visible: !dataLayersVisible.find(
                                      (obj) => obj.layerName === data
                                    ).visible,
                                  };
                                }
                                return obj;
                              });
                              return updatedObjects;
                            });
                          }}
                        />
                      ) : (
                        <FaEye
                          onClick={() => {
                            setDataLayersVisible((prevObjects) => {
                              const updatedObjects = prevObjects.map((obj) => {
                                if (obj.layerName === data) {
                                  return {
                                    ...obj,
                                    visible: !dataLayersVisible.find(
                                      (obj) => obj.layerName === data
                                    ).visible,
                                  };
                                }
                                return obj;
                              });
                              return updatedObjects;
                            });
                          }}
                        />
                      )}
                    </ListItem>
                  );
                })}
              </List>
            </TabPanel_DV>
            <TabPanel_DV value={value_tab_dv} index={1}>
              <div>
                <div
                  style={{
                    color: "white",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  Data Table
                </div>
                <div
                  className=""
                  style={{
                    position: "absolute",
                    right: "0px",
                    zIndex: "1",
                    background: "black",
                    opacity: "0.75",
                    color: "white",
                    height: boxHeight * 0.85 - 50,
                    padding: "5px",
                    width: "100%",
                  }}
                >
                  <table
                    className="large-2"
                    style={{
                      textAlign: "center",
                      width: "100%",
                      overflowY: "scroll",
                      display: "block",
                      height: "88%",
                      borderBottom: "0.01em solid white",
                    }}
                  >
                    <thead
                      style={{
                        top: "0",
                        position: "sticky",
                        background: "gray",
                      }}
                    >
                      <tr style={{}}>
                        {currentLayerDataHeader.map((data, index) => {
                          return (
                            <td style={{ textAlign: "center" }}>{data}</td>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {currentPageData.map((data: any, index: number) => (
                        <tr
                          style={{}}
                          onClick={() => {
                            setCurrentMarkerData({ data: data, id: index });
                          }}
                          className={`markerTable ${currentMarkerData?.data == data && "active"
                            }`}
                        >
                          {currentLayerDataHeader.map((header, index) => {
                            return (
                              <td
                                style={{
                                  textAlign: "center",
                                  padding: "10px",
                                }}
                              >
                                {data[header]}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        position: "absolute",
                        bottom: "0",
                        marginLeft: "35%",
                        width: "30%",
                      }}
                    >
                      <label
                        className="csv"
                        id="prev-button"
                        onClick={prevPage}
                      >
                        prev
                      </label>
                      <label className="csv">{currentPage}</label>
                      <label
                        className="csv"
                        id="next-button"
                        onClick={nextPage}
                      >
                        next
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel_DV>
            <div
              style={{
                width: 20,
                height: 20,
                background: "white",
                position: "absolute",
                bottom: "0",
                right: "0",
                zIndex: "10",
              }}
            ></div>
          </Box>
        </div>
      </Draggable>

      {/* -------------------------   P&B layout --------------------- */}
      <Draggable
        position={draggablePositionData}
        onDrag={handleDragData}
        disabled={false}
      >
        <div
          className="PDdata"
          style={
            pbVisible
              ? { display: "none" }
              : {
                position: "fixed",
                right: "25%",
                marginTop: "7%",

                zIndex: "1",
                width: "50%",
                height: "650px",
                backgroundColor: "black",
                display: "flex",
                flexDirection: "row",
                borderRadius: "10px",
                opacity: "0.75",
              }
          }
        >
          <div
            style={{
              width: "30%",
              height: "100%",
              borderTopLeftRadius: "10px",
              borderBottomLeftRadius: "10px",
              borderRight: "0.1rem solid white",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={value_tab_pb}
                  onChange={handleTabPBChange}
                  aria-label="basic tabs example"
                >
                  <Tab
                    label="Person"
                    {...tapProps_PB(0)}
                    style={{ color: "white", width: "50%" }}
                    onClick={() => {
                      setPbMode("person");
                    }}
                  />
                  <Tab
                    label="company"
                    {...tapProps_PB(1)}
                    style={{ color: "white", width: "50%" }}
                    onClick={() => {
                      setPbMode("company");
                    }}
                  />
                </Tabs>
              </Box>
              <TabPanel_PB value={value_tab_pb} index={0}>
                <div className="drawTab">
                  <div style={{ paddingBottom: "10px" }}></div>

                  <div style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                      style={{ borderColor: "white", width: "50%" }}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                      style={{
                        marginLeft: "5px",
                        width: "50%",
                        borderColor: "white",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="Address"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                      }}
                      style={{ width: "100%", borderColor: "white" }}
                    />
                  </div>
                  <div style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: "100%", borderColor: "white" }}
                    />
                  </div>
                  <div style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="Phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      style={{ width: "100%", borderColor: "white" }}
                    />
                  </div>
                  <div style={{ textAlign: "center", color: "white" }}>
                    Search Result : {pSearchCount}
                  </div>
                  <div
                    className="large-2"
                    style={{
                      width: "100%",
                      height: "300px",
                      border: "0.01em solid white",
                      borderRadius: "5px",
                      overflowY: "scroll",
                    }}
                  >
                    <ul style={{ width: "100%", height: "100%" }}>
                      {searchPeopleData.map((data, index) => {
                        return (
                          <li
                            style={{ padding: "10px", borderRadius: "10px" }}
                            onClick={() => {
                              displayPeopleData(data);
                            }}
                          >
                            {data["first_name"] +
                              " " +
                              data["last_name"] +
                              " " +
                              data["birth_date"]}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </TabPanel_PB>
              <TabPanel_PB value={value_tab_pb} index={1}>
                <div className="drawTab">
                  <div style={{ paddingBottom: "10px" }}></div>

                  <div style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={cName}
                      onChange={(e) => {
                        setCName(e.target.value);
                      }}
                      style={{ width: "100%", borderColor: "white" }}
                    />
                  </div>

                  <div style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="Ticker"
                      value={cticker}
                      onChange={(e) => {
                        setCticker(e.target.value);
                      }}
                      style={{ width: "100%", borderColor: "white" }}
                    />
                  </div>
                  <div style={{ display: "flex" }}>
                    <input
                      type="text"
                      placeholder="Website"
                      value={cWebsite}
                      onChange={(e) => {
                        setCWebsite(e.target.value);
                      }}
                      style={{ width: "100%", borderColor: "white" }}
                    />
                  </div>
                  <div style={{ textAlign: "center", color: "white" }}>
                    Search Result : {pSearchCount}
                  </div>
                  <div
                    className="large-2"
                    style={{
                      width: "100%",
                      height: "300px",
                      border: "0.01em solid white",
                      borderRadius: "5px",
                      overflowY: "scroll",
                    }}
                  >
                    <ul style={{ width: "100%", height: "100%" }}>
                      {searchCompanyData.map((data, index) => {
                        return (
                          <li
                            style={{ padding: "10px", borderRadius: "10px" }}
                            onClick={() => {
                              displayCompanyData(data);
                            }}
                          >
                            {data["id"]}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </TabPanel_PB>

              <button
                className="geoStyleBtn"
                style={{ marginLeft: "20px" }}
                onClick={() => {
                  if (pbMode === "person") getPersonData();
                  else if (pbMode === "company")
                    getCompanyData(cticker, cName, cWebsite);
                }}
              >
                Search
              </button>
              <button
                className="geoStyleBtn"
                style={{ marginLeft: "20px" }}
                onClick={() => {
                  handleGeneratePdf();
                }}
              >
                Download
              </button>
            </Box>
          </div>
          <div
            style={{
              width: "70%",
              height: "100%",
              borderTopRightRadius: "10px",
              borderBottomRightRadius: "10px",
            }}
          >
            <div className="PBData" style={{ color: "white", height: "100%" }}>
              {pbMode === "person" ? (
                <div>
                  <div
                    style={{
                      fontSize: "24px",
                      lineHeight: "45px",
                      width: "100%",
                      height: "50px",
                      textAlign: "center",
                      paddingTop: "10px",
                    }}
                  >
                    Identity Details
                  </div>
                  <div style={{ padding: "20px" }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        textAlign: "center",
                        padding: "5px",
                        borderBottom: "0.05em solid",
                        borderTop: "0.05em solid",
                      }}
                    >
                      PERSONAL INFORMATION
                      <br />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        padding: "15px",
                      }}
                    >
                      <div style={{ width: "10%", marginLeft: "3%" }}>
                        ID:
                        <br />
                        Name:
                        <br />
                        Address:
                        <br />
                        Emails:
                        <br />
                        Phone:
                      </div>
                      <div style={{ width: "85%", marginLeft: "25px" }}>
                        <div>{pid}</div>
                        <div>{pname}</div>
                        <div>{paddress}</div>
                        <div style={{ width: "100%", overflowX: "hidden" }}>
                          {pemail}
                        </div>
                        <div style={{ width: "100%", overflowX: "hidden" }}>
                          {pphone}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontWeight: "bold",
                        textAlign: "center",
                        padding: "5px",
                        borderBottom: "0.05em solid",
                        borderTop: "0.05em solid",
                      }}
                    >
                      SOCIAL MEDIA INFORMATION
                      <br />
                    </div>
                    <div style={{ padding: "15px" }}>
                      <div>
                        <div style={{ marginLeft: "3%" }}>Facebook:</div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <div
                            style={{
                              width: "10%",
                              marginLeft: "5%",
                              padding: "10px",
                              fontSize: "14px",
                            }}
                          >
                            ID:
                            <br />
                            URL:
                            <br />
                            Username:
                          </div>
                          <div
                            style={{
                              padding: "10px",
                              marginLeft: "25px",
                              fontSize: "14px",
                            }}
                          >
                            <div>{pfacebook_id}</div>
                            <div>{pfacebook_url}</div>
                            <div>{pfacebook_un}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div style={{ marginLeft: "3%" }}>LinkedIn:</div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <div
                            style={{
                              width: "10%",
                              marginLeft: "5%",
                              padding: "10px",
                              fontSize: "14px",
                            }}
                          >
                            ID:
                            <br />
                            URL:
                            <br />
                            Username:
                          </div>
                          <div
                            style={{
                              padding: "10px",
                              marginLeft: "25px",
                              fontSize: "14px",
                            }}
                          >
                            <div>{plinkdin_id}</div>
                            <div>{plinkdin_url}</div>
                            <div>{plinkdin_un}</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div style={{ marginLeft: "3%" }}>Twitter:</div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <div
                            style={{
                              width: "10%",
                              marginLeft: "5%",
                              padding: "10px",
                              fontSize: "14px",
                            }}
                          >
                            URL:
                            <br />
                            Username:
                          </div>
                          <div
                            style={{
                              padding: "10px",
                              marginLeft: "25px",
                              fontSize: "14px",
                            }}
                          >
                            <div>{ptwitter_url}</div>
                            <div>{ptwitter_un}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      fontSize: "24px",
                      lineHeight: "45px",
                      width: "100%",
                      height: "50px",
                      textAlign: "center",
                      paddingTop: "10px",
                    }}
                  >
                    Company Details.
                  </div>
                  <div style={{ padding: "20px" }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        textAlign: "center",
                        padding: "5px",
                        borderBottom: "0.05em solid",
                        borderTop: "0.05em solid",
                      }}
                    >
                      BUSINESS INFORMATION
                      <br />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        padding: "15px",
                      }}
                    >
                      <div style={{ width: "10%", marginLeft: "3%" }}>
                        ID:
                        <br />
                        Name:
                        <br />
                        Founded:
                        <br />
                        Industry:
                        <br />
                        Website:
                        <br />
                        Summary:
                      </div>
                      <div style={{ marginLeft: "25px" }}>
                        <div>{bid}</div>
                        <div>{bname}</div>
                        <div>{bfounded}</div>
                        <div>{bindustry}</div>
                        <div>{bwebsite}</div>
                        <div>{bsummary}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontWeight: "bold",
                        textAlign: "center",
                        padding: "5px",
                        borderBottom: "0.05em solid",
                        borderTop: "0.05em solid",
                      }}
                    >
                      SOCIAL MEDIA INFORMATION
                      <br />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        padding: "15px",
                      }}
                    >
                      <div style={{ width: "10%", marginLeft: "3%" }}>
                        Linkdlin:
                        <br />
                        Facebook:
                        <br />
                        Twitter:
                        <br />
                        Crunch:
                      </div>
                      <div style={{ marginLeft: "25px" }}>
                        <div>{blinkdin}</div>
                        <div>{bfacebook}</div>
                        <div>{btwitter}</div>
                        <div>{bcrunchbase}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Draggable>

      {/* ------------------------- Geo Point Table layout-------------------- */}
      <div
        style={
          loading
            ? {
              position: "absolute",
              zIndex: "10",
              textAlign: "center",
              width: "100%",
              height: "90%",
              display: "block",
            }
            : { display: "none" }
        }
      >
        <img src={assets.images.loading} style={{ marginTop: "10%" }} />
        <h2 style={{ color: "white", marginTop: "-10%" }}>{loadingText}</h2>
      </div>

      {/* -----------------------------import various csv , Data layer  */}

      <Draggable
        position={draggablePositionData}
        onDrag={handleDragData}
        disabled={false}
      >
        <div
          className=""
          style={
            dataVisible
              ? { display: "none" }
              : {
                position: "fixed",
                right: "25%",
                marginTop: "7%",
                zIndex: "2",
                width: "50%",
                height: "650px",
                display: "flex",
                // display : 'none',
                backgroundColor: "black",
                borderRadius: "10px",
                opacity: "0.75",
              }
          }
        >
          <div
            style={{
              width: "30%",
              height: "100%",
              borderTopLeftRadius: "10px",
              borderBottomLeftRadius: "10px",
              borderRight: "0.1rem solid white",
            }}
          >
            <div className="PBData" style={{ color: "white", height: "100%" }}>
              <div>
                <div
                  style={{
                    fontSize: "24px",
                    lineHeight: "45px",
                    width: "100%",
                    height: "50px",
                    textAlign: "center",
                    paddingTop: "10px",
                  }}
                >
                  Layers
                </div>
                <div className="drawTab">
                  <div
                    style={{
                      width: "100%",
                      height: "450px",
                      border: "0.1rem solid white",
                      borderRadius: "10px",
                    }}
                  >
                    <ul style={{ width: "100%", height: "100%" }}>
                      {dataLayers.map((data, index) => {
                        return (
                          <li
                            style={{ padding: "10px", borderRadius: "10px" }}
                            onClick={() => setMCurrentLayer(data)}
                            className={`list-item ${mCurrentLayer == data && "active"
                              }`}
                          >
                            {data}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div
                    style={{
                      // display: "block",
                      position: "absolute",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      paddingTop: "5px",
                      zIndex: "1",
                      width: "25%",
                      marginBottom: "4%",
                      bottom: "0",
                      // overflowY: 'scroll'
                    }}
                  >
                    <label
                      className="csv"
                      onClick={() => {
                        addDataLayer();
                      }}
                    >
                      Add
                    </label>
                    <label
                      className="csv"
                      onClick={() => {
                        removeDataLayer();
                      }}
                    >
                      Remove
                    </label>
                    {/* <label className='csv' onClick={() => {

                }}>
                  Remove layer
                </label> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              width: "70%",
              height: "100%",
              borderTopRightRadius: "10px",
              borderBottomRightRadius: "10px",
            }}
          >
            <div className="PBData" style={{ color: "white", height: "100%" }}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    lineHeight: "45px",
                    width: "100%",
                    height: "50px",
                    textAlign: "center",
                    paddingTop: "10px",
                  }}
                >
                  Preview Data
                </div>
                <table
                  className="large-2"
                  style={{
                    // textAlign: "center",
                    width: "100%",
                    height: "25%",
                    display: "table-cell",
                    overflow: "scroll",
                    marginBottom: "0px",
                    borderBottom: "0.01em solid white",
                    // height: "100%"
                  }}
                >
                  <thead
                    style={{ background: "gray", position: "sticky", top: "0" }}
                  >
                    <tr style={{}}>
                      {csvHeader.map((data, index) => {
                        return <td style={{ textAlign: "center" }}>{data}</td>;
                      })}
                    </tr>
                  </thead>
                  <tbody style={{}}>
                    {csvData.map((data, index) => {
                      return (
                        <tr style={{}}>
                          {csvHeader.map((header, index) => {
                            return (
                              <td
                                style={{ textAlign: "center", padding: "10px" }}
                              >
                                {data[header]}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div
                  style={{
                    fontSize: "20px",
                    lineHeight: "45px",
                    width: "100%",
                    height: "50px",
                    textAlign: "center",
                    paddingTop: "10px",
                  }}
                >
                  Options
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    height: "60%",
                    padding: "10px",
                    justifyContent: "space-around",
                  }}
                >
                  <div style={{ width: "48%", border: "0.01em solid white" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        lineHeight: "45px",
                        width: "100%",
                        height: "50px",
                        textAlign: "center",
                        padding: "5px",
                        borderBottom: "0.01em solid white",
                      }}
                    >
                      Create Data Field
                    </div>

                    <Box sx={{ width: "100%" }} style={{ height: "86%" }}>
                      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs
                          value={value_tab_layer}
                          onChange={handleTabLayerChange}
                          aria-label="basic tabs example"
                        >
                          <Tab
                            label="From CSV"
                            {...tapProps_PB(0)}
                            style={{ color: "white", width: "50%" }}
                            onClick={() => {
                              setInputMode("csv");
                            }}
                          />
                          <Tab
                            label="Manual"
                            {...tapProps_PB(1)}
                            style={{ color: "white", width: "50%" }}
                            onClick={() => {
                              setInputMode("manual");
                            }}
                          />
                        </Tabs>
                      </Box>
                      <TabPanel_PB value={value_tab_layer} index={0}>
                        <div
                          className="drawTab"
                          style={{ height: "395px", padding: "10px" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              height: "56%",
                              width: "90%",
                              transform: "translateX(5%)",
                              marginBottom: "10px",
                              borderRadius: "10px",
                              border: "0.01em solid white",
                              flexDirection: "column",
                              padding: "27px",
                            }}
                          >
                            {csvHeader.map((data, index) => {
                              return (
                                <>
                                  <div
                                    style={{
                                      width: "100%",
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <div>{data}</div>
                                    {/* <div style={{ display: 'flex' }}>
                                          <button style={{ width: '100%' }}>E</button>
                                          <button style={{ width: '100%' }}>D</button>
                                        </div> */}
                                  </div>
                                </>
                              );
                            })}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-evenly",
                            }}
                          >
                            <label className="csv">
                              <input
                                id="Image"
                                type="file"
                                onChange={readCSVFile}
                              />
                              From CSV
                            </label>
                          </div>
                        </div>
                      </TabPanel_PB>
                      <TabPanel_PB value={value_tab_layer} index={1}>
                        <div
                          className="drawTab"
                          style={{ height: "395px", padding: "10px" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              width: "90%",
                              transform: "translateX(5%)",
                            }}
                          >
                            <input
                              type="text"
                              value={fieldName}
                              onChange={(e) => {
                                handlFieldName(e.target.value);
                              }}
                              placeholder="Enter a new field name"
                              style={{ width: "100%", borderColor: "white" }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              height: "45%",
                              width: "90%",
                              transform: "translateX(5%)",
                              marginBottom: "10px",
                              borderRadius: "10px",
                              border: "0.01em solid white",
                              flexDirection: "column",
                              padding: "27px",
                            }}
                          >
                            {mNewFieldData.map((data, index) => {
                              return (
                                <>
                                  <div
                                    style={{
                                      width: "100%",
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <div>{data}</div>
                                    <div style={{ display: "flex" }}>
                                      <button style={{ width: "100%" }}>
                                        E
                                      </button>
                                      <button style={{ width: "100%" }}>
                                        D
                                      </button>
                                    </div>
                                  </div>
                                </>
                              );
                            })}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-evenly",
                            }}
                          >
                            <label
                              className="csv"
                              style={{ width: "30%" }}
                              onClick={addFieldName}
                            >
                              Add
                            </label>
                            <label
                              className="csv"
                              style={{ width: "30%" }}
                              onClick={() => {
                                setMNewFieldData([]);
                              }}
                            >
                              Clear
                            </label>
                            <label
                              className="csv"
                              style={{ width: "30%" }}
                              onClick={() => {
                                acceptDataField();
                              }}
                            >
                              Accept
                            </label>
                          </div>
                        </div>
                      </TabPanel_PB>
                    </Box>
                  </div>
                  <div style={{ width: "48%", border: "0.01em solid white" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        lineHeight: "45px",
                        width: "100%",
                        height: "50px",
                        textAlign: "center",
                        padding: "5px",
                        borderBottom: "0.01em solid white",
                      }}
                    >
                      Properties
                    </div>
                    <div
                      style={{
                        display: "flex",
                        marginTop: "20px",
                        width: "90%",
                        transform: "translateX(5%)",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Enter a layer name"
                        value={layer}
                        onChange={(e) => {
                          setLayer(e.target.value);
                        }}
                        style={{ width: "100%", borderColor: "white" }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <label className="csv">
                        <input
                          type="file"
                          onChange={handleLayerImageFileChange}
                        />
                        Layer Image
                      </label>
                      <label className="csv">
                        <input
                          type="file"
                          onChange={handleMarkerImageFileChange}
                        />
                        Marker Image
                      </label>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        height: "30%",
                      }}
                    >
                      <label className="csv">
                        {selectedLayerImageFile && (
                          <img
                            src={selectedLayerImageFile}
                            alt="Selected file"
                            style={{ height: "100%", width: "100%" }}
                          />
                        )}
                      </label>

                      <label className="csv">
                        {selectedMarkerImageFile && (
                          <img
                            src={selectedMarkerImageFile}
                            alt="Selected file"
                            style={{ height: "100%", width: "100%" }}
                          />
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Draggable>

      {/* --------------------------------------------  */}
      <div
        ref={mapRef}
        className="map"
        style={{
          padding: "0px !important",
          height: "100%",
          width: "100%",
          // marginTop: "64px",
        }}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
    </>
  );
};

export default SatelitteMap;

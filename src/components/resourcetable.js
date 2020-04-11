import React, {useState, useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {useTable} from 'react-table';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import InfiniteScroll from 'react-infinite-scroll-component';
import Autosuggest from 'react-autosuggest';

const usePanelSummaryStyles = makeStyles((theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  root: {
    backgroundColor: '#201aa220',
    height: '4rem',
  },
}));

const usePanelStyles = makeStyles((theme) => ({
  root: {
    width: 'calc(100%-0.2rem)',
    marginBottom: '0.2rem',
  },
}));
const useItemTextStyles = makeStyles((theme) => ({
  primary: {
    fontFamily: 'Archia',
    fontWeight: 500,
    fontStyle: 'normal',
    fontSize: '13px',
    fontTransform: 'uppercase',
  },
  secondary: {
    fontFamily: 'Archia',
    fontWeight: 400,
    fontStyle: 'normal',
    fontSize: '12px',
    // fontTransform: 'uppercase'
  },
}));

const getNumbersLink = (initialValue) => {
  // const phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  const numbf = initialValue.split(',');
  // console.log('numbers are', '' + numbf.length);

  const numbg = /^\d{5,12}$/g;
  const numberList = numbf.map((iv, i) => {
    iv = iv.trim();
    console.log('numbr ', '' + iv);
    return iv.replace(numbg, '<a href="tel:$&">$&</a>');
  });
  console.log('numberList ', '' + numberList);
  return {numberList};
};

const getFormattedLink = (initialValue) => {
  const reurl1 = /\s*(https?:\/\/.+)\s*/g;
  // let reurl2 = /\s*.(www\..+)\s/g
  const reinsta = /\s*Instagram: @(.+)\s*/g;
  const refb = /\s*Facebook: @(.+)\s*/g;
  const noLetters = /^[\d,\s]+$/;
  let s3 = '';
  if (initialValue.match(noLetters) != null) {
    const formatedLink = getNumbersLink(initialValue);
    const links = JSON.parse(JSON.stringify(formatedLink));
    console.log('success val', ' --' + JSON.stringify(links.numberList));
    s3 = String(links.numberList).replace(/,/g, '<br>');
  } else {
    const s1 = initialValue.replace(reurl1, '<a href="$1">Link</a>');
    const s2 = s1.replace(
      reinsta,
      '<a href="https://www.instagram.com/$1">Instagram: @$1</a>'
    );
    s3 = s2.replace(
      refb,
      '<a href="https://www.facebook.com/$1">Facebook: @$1</a>'
    );
  }
  return (
    <div
      className="tablecelldata"
      dangerouslySetInnerHTML={{
        __html: s3,
      }}
    ></div>
  );
};

const FormattedCell = ({value: initialValue, editable}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue);
  const reurl1 = /\s*(https?:\/\/.+)\s*/g;
  // let reurl2 = /\s*.(www\..+)\s/g
  const reinsta = /\s*Instagram: @(.+)\s*/g;
  const refb = /\s*Facebook: @(.+)\s*/g;

  // If the initialValue is changed externall, sync it up with our state
  React.useEffect(() => {
    const noLetters = /^[\d,\s]+$/;
    if (initialValue.match(noLetters) != null) {
      const formatedLink = getNumbersLink(initialValue);
      const links = JSON.parse(JSON.stringify(formatedLink));
      setValue(String(links.numberList).replace(/,/g, '<br>'));
    } else {
      const s1 = initialValue.replace(reurl1, '<a href="$1">Link</a>');
      const s2 = s1.replace(
        reinsta,
        '<a href="https://www.instagram.com/$1">Instagram: @$1</a>'
      );
      const s3 = s2.replace(
        refb,
        '<a href="https://www.facebook.com/$1">Facebook: @$1</a>'
      );
      setValue(s3);
    }
  }, [initialValue, reurl1, refb, reinsta]);

  return (
    <div
      className="tablecelldata"
      dangerouslySetInnerHTML={{
        __html: value,
      }}
    ></div>
  );
};

// searchbar stuff

const getSuggestions = (value, resources) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;
  // console.log(resources);
  return inputLength === 0
    ? resources
    : resources.filter(
        (resource) =>
          resource.category.toLowerCase().includes(inputValue.toLowerCase()) ||
          resource.descriptionandorserviceprovided
            .toLowerCase()
            .includes(inputValue.toLowerCase()) ||
          resource.nameoftheorganisation
            .toLowerCase()
            .includes(inputValue.toLowerCase())
      );
};

const getSuggestionValue = (suggestion) => suggestion.nameoftheorganisation;

const renderSuggestion = (suggestion) => (
  <div>{suggestion.nameoftheorganisation}</div>
);

function ResourceTable({columns, data, isDesktop, totalCount, onScrollUpdate}) {
  const classesPannelSummary = usePanelSummaryStyles();
  const classesPanel = usePanelStyles();
  const classesListItemText = useItemTextStyles();
  const defaultColumn = React.useMemo(
    () => ({
      Cell: FormattedCell,
    }),
    []
  );

  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState(data);

  useEffect(() => {
    setSuggestions(data);
    setSearchValue('');
  }, [data]);

  const onChange = (event, {newValue}) => {
    setSearchValue(newValue);
  };

  const onSuggestionsFetchRequested = ({value}) => {
    setSuggestions(getSuggestions(value, data));
  };

  const inputProps = {
    placeholder: 'Search for keyword',
    value: searchValue,
    onChange: onChange,
  };

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
  } = useTable({
    columns,
    data: suggestions,
    defaultColumn,
  });

  // Render the UI for your table
  if (isDesktop === true)
    return (
      <>
        <div className="searchbar">
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            alwaysRenderSuggestions={true}
          />
        </div>
        <div className="tableandcontrols">
          <InfiniteScroll
            dataLength={data.length}
            hasMore={data.length < totalCount}
            next={onScrollUpdate}
            loader={<h4>Fetching more information, please wait.</h4>}
          >
            <table {...getTableProps()}>
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    {...headerGroup.getHeaderGroupProps()}
                  >
                    {headerGroup.headers.map((column) => (
                      <th key={column.id} {...column.getHeaderProps()}>
                        {column.render('Header')}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row, i) => {
                  prepareRow(row);
                  return (
                    <tr key={row.id} {...row.getRowProps()}>
                      {row.cells.map((cell) => {
                        return (
                          <td key={cell.id} {...cell.getCellProps()}>
                            {cell.render('Cell', {editable: false})}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      </>
    );
  else
    return (
      <>
        <div className="searchbar">
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            // highlightFirstSuggestion={true}
            // onSuggestionSelected = {this.props.onSuggestionSelected}
          />
        </div>
        <div className="resourcesaccordion">
          <InfiniteScroll
            dataLength={data.length}
            hasMore={data.length < totalCount}
            next={onScrollUpdate}
            loader={<h4>Fetching more information, please wait.</h4>}
          >
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <ExpansionPanel
                  key={row.id}
                  classes={{root: classesPanel.root}}
                >
                  <ExpansionPanelSummary
                    classes={{
                      content: classesPannelSummary.content,
                      root: classesPannelSummary.root,
                    }}
                  >
                    {/* <div className="expanelheading"
                                 style={{display: 'flex',
                                         flexDirection: 'row',
                                         justifyContent: 'space-between',
                                         backgroundColor: 'blue'}}> */}
                    <div
                      className="orgname"
                      style={{
                        maxWidth: '10rem',
                        textAlign: 'start',
                        color: '#201aa2dd',
                      }}
                    >
                      <h6>{row.values['nameoftheorganisation']}</h6>
                    </div>
                    <div
                      className="orgcategory"
                      style={{maxWidth: '10.9rem', textAlign: 'end'}}
                    >
                      <h6>{row.values['category']}</h6>
                    </div>
                    {/* </div> */}
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <List disablePadding={true} dense={true}>
                      <ListItem
                        alignItems="flex-start"
                        dense={true}
                        divider={true}
                      >
                        <ListItemText
                          primary="Organisation Name"
                          secondary={row.values['nameoftheorganisation']}
                          classes={{
                            primary: classesListItemText.primary,
                            secondary: classesListItemText.secondary,
                          }}
                        />
                      </ListItem>
                      <ListItem
                        alignItems="flex-start"
                        dense={true}
                        divider={true}
                      >
                        <ListItemText
                          primary="Location"
                          secondary={row.values['city']}
                          classes={{
                            primary: classesListItemText.primary,
                            secondary: classesListItemText.secondary,
                          }}
                        />
                      </ListItem>
                      <ListItem
                        alignItems="flex-start"
                        dense={true}
                        divider={true}
                      >
                        <ListItemText
                          primary="Description"
                          secondary={
                            row.values['descriptionandorserviceprovided']
                          }
                          classes={{
                            primary: classesListItemText.primary,
                            secondary: classesListItemText.secondary,
                          }}
                        />
                      </ListItem>
                      <ListItem
                        alignItems="flex-start"
                        dense={true}
                        divider={true}
                      >
                        <ListItemText
                          primary="Category"
                          secondary={row.values['category']}
                          classes={{
                            primary: classesListItemText.primary,
                            secondary: classesListItemText.secondary,
                          }}
                        />
                      </ListItem>
                      <ListItem
                        alignItems="flex-start"
                        dense={true}
                        divider={true}
                      >
                        <ListItemText
                          primary="Phonenumber"
                          secondary={getFormattedLink(
                            row.values['phonenumber']
                          )}
                          classes={{
                            primary: classesListItemText.primary,
                            secondary: classesListItemText.secondary,
                          }}
                        />
                      </ListItem>
                      <ListItem
                        alignItems="flex-start"
                        dense={true}
                        divider={true}
                      >
                        <ListItemText
                          primary="Website"
                          secondary={getFormattedLink(row.values['contact'])}
                          classes={{
                            primary: classesListItemText.primary,
                            secondary: classesListItemText.secondary,
                          }}
                        />
                      </ListItem>
                    </List>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              );
            })}
          </InfiniteScroll>
        </div>
      </>
    );
}

export default ResourceTable;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import LoadingBar from "react-top-loading-bar";
import "./App.css"; // Import the custom CSS file
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
export const filterOptions = {
  commodity: [
    "GOLD - COMMODITY EXCHANGE INC.",
    "SILVER - COMMODITY EXCHANGE INC.",
  ],
  crypto: [
    "BITCOIN - CHICAGO MERCANTILE EXCHANGE",
    "MICRO BITCOIN - CHICAGO MERCANTILE EXCHANGE",
    "ETHER CASH SETTLED - CHICAGO MERCANTILE EXCHANGE",
    "MICRO ETHER - CHICAGO MERCANTILE EXCHANGE",
  ],
  currencies: [
    "AUSTRALIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE",
    "BRITISH POUND - CHICAGO MERCANTILE EXCHANGE",
    "CANADIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE",
    "EURO FX - CHICAGO MERCANTILE EXCHANGE",
    "JAPANESE YEN - CHICAGO MERCANTILE EXCHANGE",
    "SWISS FRANC - CHICAGO MERCANTILE EXCHANGE",
    "USD INDEX - ICE FUTURES U.S.",
    "MEXICAN PESO - CHICAGO MERCANTILE EXCHANGE",
    "NZ DOLLAR - CHICAGO MERCANTILE EXCHANGE",
    "BRAZILIAN REAL - CHICAGO MERCANTILE EXCHANGE",
    "SO AFRICAN RAND - CHICAGO MERCANTILE EXCHANGE",
  ],
  indexes: [
    "S&P 500 Consolidated - CHICAGO MERCANTILE EXCHANGE",
    "NASDAQ MINI - CHICAGO MERCANTILE EXCHANGE",
    "DJIA x $5 - CHICAGO BOARD OF TRADE",
    "RUSSELL E-MINI - CHICAGO MERCANTILE EXCHANGE",
    "E-MINI S&P 400 STOCK INDEX - CHICAGO MERCANTILE EXCHANGE",
    "E-MINI S&P 500 - CHICAGO MERCANTILE EXCHANGE",
    "VIX FUTURES - CBOE FUTURES EXCHANGE",
  ],
  Energies: [
    "WTI-PHYSICAL - NEW YORK MERCANTILE EXCHANGE",
    "GASOLINE RBOB - NEW YORK MERCANTILE EXCHANGE",
    "NY HARBOR ULSD - NEW YORK MERCANTILE EXCHANGE",
    "NAT GAS NYME - NEW YORK MERCANTILE EXCHANGE",
  ],
  Treasuries: [
    "FED FUNDS - CHICAGO BOARD OF TRADE",
    "UST 2Y NOTE - CHICAGO BOARD OF TRADE",
    "UST 5Y NOTE - CHICAGO BOARD OF TRADE",
    "UST 10Y NOTE - CHICAGO BOARD OF TRADE",
  ],
};

const App = () => {
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const loadingBarRef = useRef(null);
  // State to track checkbox
  const [isChecked, setIsChecked] = useState(false);

  // Handler for checkbox state change
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };
  // Fetch data based on selected subcategory
  const fetchData = async (filter, limit) => {
    setLoading(true);
    loadingBarRef.current.continuousStart();
    try {
      const response = await axios.get(
        `https://publicreporting.cftc.gov/resource/6dca-aqww.json?market_and_exchange_names=${encodeURIComponent(
          filter
        )}&$order=report_date_as_yyyy_mm_dd%20DESC&$limit=${limit}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      loadingBarRef.current.complete();
    }
  };

  // Handle the change in main category filter
  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setSelectedFilter(newFilter);
    setSelectedSubCategory(""); // Reset subcategory when main category changes
    setLimit(5); // Reset limit on filter change
    const subCategoryOptions = filterOptions[newFilter] || []; // Get subcategory options based on main filter

    setSubCategoryOptions(subCategoryOptions); // Update subcategory options

    if (subCategoryOptions.length > 0) {
      setSelectedSubCategory(subCategoryOptions[0]); // Set the first subcategory as selected
      fetchData(subCategoryOptions[0], 5); // Fetch data for the first subcategory
    } else {
      setData([]); // Clear data if no valid subcategory
    }
  };

  // Handle the change in subcategory filter
  const handleSubCategoryChange = (event) => {
    const newSubCategory = event.target.value;
    setSelectedSubCategory(newSubCategory);
    setLimit(5); // Reset limit on subcategory change
    if (newSubCategory) {
      fetchData(newSubCategory, 5); // Fetch data for the selected subcategory
    } else {
      setData([]); // Clear data when no subcategory is selected
    }
  };

  const handleLimitChange = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setLimit(newLimit);
    if (selectedSubCategory) {
      fetchData(selectedSubCategory, newLimit); // Fetch data for the selected limit
    }
  };

  useEffect(() => {
    // Fetch initial data if a filter is selected
    if (selectedSubCategory) {
      fetchData(selectedSubCategory, limit);
    }
  }, [selectedSubCategory, limit]);

  return (
    <div className="app-container">
      {/* Top Loading Bar */}
      <LoadingBar
        color="#CE93D8"
        ref={loadingBarRef}
        height={6}
        shadow={true}
      />

      <h2 style={{ textAlign: "center" }}>
        Exchange Data {selectedSubCategory && ` - ${selectedSubCategory}`}
      </h2>

      <div className="filter-container">
        <div className="filter-group">
          <label htmlFor="filter" className="filter-label">
            Exchange:
          </label>
          <Select
            value={selectedFilter}
            onChange={handleFilterChange}
            displayEmpty
            style={{ width: "200px" }}
          >
            <MenuItem value="" disabled>
              Select
            </MenuItem>
            {Object.keys(filterOptions).map((filter) => (
              <MenuItem key={filter} value={filter}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </div>

        {selectedFilter && (
          <div className="filter-group">
            <label htmlFor="subCategory" className="filter-label">
              Subcategory:
            </label>
            <Select
              id="subCategory"
              value={selectedSubCategory}
              onChange={handleSubCategoryChange}
              style={{ width: "250px" }}
            >
              <MenuItem value="">Select Subcategory</MenuItem>
              {subCategoryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </div>
        )}

        {selectedSubCategory && (
          <div className="filter-group">
            <label htmlFor="limit" className="filter-label">
              Limit:
            </label>
            <Select
              id="limit"
              value={limit}
              onChange={handleLimitChange}
              style={{ width: "200px" }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
              <MenuItem value={200}>200</MenuItem>
              <MenuItem value={500}>500</MenuItem>
              <MenuItem value={1000}>1000</MenuItem>
              <MenuItem value={2000}>2000</MenuItem>
            </Select>
          </div>
        )}

        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked}
                onChange={handleCheckboxChange}
                color="primary"
              />
            }
            label="Show Commercial Data"
          />
        </div>
      </div>

      {loading && <CircularProgress className="loading-spinner" />}

      {data.length > 0 && (
        <>
          <Table className="data-table responsive-table-container">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell style={{ textAlign: "center" }} colSpan={4}>
                  Non-Commercial
                </TableCell>
                {isChecked && (
                  <>
                    <TableCell colSpan={2}>Commercial</TableCell>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell colSpan={2}>Non-Reportable</TableCell>
                  </>
                )}
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Net Values</TableCell>
                <TableCell>Long</TableCell>
                <TableCell>Short</TableCell>
                <TableCell>Spreads</TableCell>
                {isChecked && (
                  <>
                    <TableCell>Long</TableCell>
                    <TableCell>Short</TableCell>
                    <TableCell>Long</TableCell>
                    <TableCell>Short</TableCell>
                    <TableCell>Long</TableCell>
                    <TableCell>Short</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => {
                const netPosition =
                  row.noncomm_positions_long_all &&
                  row?.noncomm_positions_short_all &&
                  row.noncomm_positions_long_all -
                    row?.noncomm_positions_short_all;

                const netChange =
                  netPosition -
                  (row.noncomm_positions_long_all -
                    row?.change_in_noncomm_long_all -
                    (row.noncomm_positions_short_all -
                      row?.change_in_noncomm_short_all));

                return (
                  <React.Fragment key={index}>
                    {/* {index == 0 && (
              <TableRow style={{ backgroundColor: "#DCDCDC" }}>
                <TableCell colSpan={3} style={{ fontWeight: "bolder" }}>
                  {row?.yyyy_report_week_ww}
                </TableCell>

                <TableCell colSpan={4} style={{ fontWeight: "bolder" }}>
                  {row?.contract_units}
                </TableCell>
                <TableCell colSpan={3} style={{ fontWeight: "bolder" }}>
                  Open Interest: {row?.open_interest_all}
                </TableCell>
              </TableRow>
            )} */}
                    {/* First Row: Data */}
                    <TableRow>
                      {/* Date for Each Record */}

                      <TableCell
                        rowSpan={3}
                        className="custom-table-cell date-cell"
                      >
                        {row?.report_date_as_yyyy_mm_dd
                          ? new Date(
                              row.report_date_as_yyyy_mm_dd
                            ).toLocaleDateString("en-CA")
                          : ""}
                      </TableCell>

                      {/* Data Values */}
                      <TableCell
                        rowSpan={2}
                        style={{ fontWeight: "bold", fontSize: "16px" }}
                        className="custom-table-cell border-top"
                      >
                        {netPosition && "Position :  "}
                        <hr />
                        {netPosition > 0 && (
                          <div className="positive-change">
                            <span className="arrow up">▲</span>
                            {netPosition
                              ? `${new Intl.NumberFormat("en-US").format(
                                  netPosition
                                )}`
                              : ""}
                          </div>
                        )}
                        {netPosition < 0 && (
                          <div className="negative-change">
                            <span className="arrow down">▼</span>
                            {netPosition
                              ? `${new Intl.NumberFormat("en-US").format(
                                  netPosition
                                )}`
                              : ""}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="custom-table-cell border-top">
                        {row?.noncomm_positions_long_all
                          ? new Intl.NumberFormat("en-US").format(
                              row.noncomm_positions_long_all
                            )
                          : ""}
                      </TableCell>
                      <TableCell className="custom-table-cell border-top">
                        {row?.noncomm_positions_short_all
                          ? new Intl.NumberFormat("en-US").format(
                              row.noncomm_positions_short_all
                            )
                          : ""}
                      </TableCell>
                      <TableCell className="custom-table-cell border-top">
                        {row?.noncomm_postions_spread_all
                          ? new Intl.NumberFormat("en-US").format(
                              row.noncomm_postions_spread_all
                            )
                          : ""}
                      </TableCell>
                      {isChecked && (
                        <>
                          <TableCell className="custom-table-cell border-top">
                            {row?.comm_positions_long_all
                              ? new Intl.NumberFormat("en-US").format(
                                  row.comm_positions_long_all
                                )
                              : ""}
                          </TableCell>
                          <TableCell className="custom-table-cell border-top">
                            {row?.comm_positions_short_all
                              ? new Intl.NumberFormat("en-US").format(
                                  row.comm_positions_short_all
                                )
                              : ""}
                          </TableCell>
                          {/* Total Reportable Positions Long */}
                          <TableCell className="custom-table-cell border-top">
                            {row?.tot_rept_positions_long_all
                              ? `${new Intl.NumberFormat("en-US").format(
                                  row.tot_rept_positions_long_all
                                )}  `
                              : ""}
                          </TableCell>

                          {/* Total Reportable Positions Short */}
                          <TableCell className="custom-table-cell border-top">
                            {row?.tot_rept_positions_short
                              ? `${new Intl.NumberFormat("en-US").format(
                                  row.tot_rept_positions_short
                                )}  `
                              : ""}
                          </TableCell>

                          {/* Non-Reportable Positions Long */}
                          <TableCell className="custom-table-cell border-top">
                            {row?.nonrept_positions_long_all
                              ? `${new Intl.NumberFormat("en-US").format(
                                  row.nonrept_positions_long_all
                                )} `
                              : ""}
                          </TableCell>

                          {/* Non-Reportable Positions Short */}
                          <TableCell className="custom-table-cell border-top">
                            {row?.nonrept_positions_short_all
                              ? `${new Intl.NumberFormat("en-US").format(
                                  row.nonrept_positions_short_all
                                )}  `
                              : ""}
                          </TableCell>
                        </>
                      )}
                    </TableRow>

                    {/* Second Row: Change Values */}
                    <TableRow>
                      <TableCell
                        style={{
                          backgroundColor:
                            row?.change_in_noncomm_long_all > 0
                              ? "#67bd90"
                              : row?.change_in_noncomm_long_all < 0
                              ? "#f18682"
                              : "transparent",
                        }}
                        className="custom-table-cell"
                      >
                        {row?.change_in_noncomm_long_all
                          ? `${row.change_in_noncomm_long_all > 0 ? "+" : ""}${
                              row.change_in_noncomm_long_all
                            } (${row?.pct_of_oi_noncomm_long_all ?? 0}%)`
                          : ""}
                      </TableCell>
                      <TableCell
                        style={{
                          backgroundColor:
                            row?.change_in_noncomm_short_all > 0
                              ? "#67bd90"
                              : row?.change_in_noncomm_short_all < 0
                              ? "#f18682"
                              : "transparent",
                        }}
                        className="custom-table-cell"
                      >
                        {row?.change_in_noncomm_short_all
                          ? `${row.change_in_noncomm_short_all > 0 ? "+" : ""}${
                              row.change_in_noncomm_short_all
                            } (${row?.pct_of_oi_noncomm_short_all ?? 0}%)`
                          : ""}
                      </TableCell>
                      <TableCell
                        style={{
                          backgroundColor:
                            row?.change_in_noncomm_spead_all > 0
                              ? "#67bd90"
                              : row?.change_in_noncomm_spead_all < 0
                              ? "#f18682"
                              : "transparent",
                        }}
                        className="custom-table-cell"
                      >
                        {row?.change_in_noncomm_spead_all
                          ? `${row.change_in_noncomm_spead_all > 0 ? "+" : ""}${
                              row.change_in_noncomm_spead_all
                            } (${row?.pct_of_oi_noncomm_spread ?? 0}%)`
                          : ""}
                      </TableCell>
                      {isChecked && (
                        <>
                          <TableCell
                            style={{
                              backgroundColor:
                                row?.change_in_comm_long_all > 0
                                  ? "#67bd90"
                                  : row?.change_in_comm_long_all < 0
                                  ? "#f18682"
                                  : "transparent",
                            }}
                            className="custom-table-cell"
                          >
                            {row?.change_in_comm_long_all
                              ? `${row.change_in_comm_long_all > 0 ? "+" : ""}${
                                  row.change_in_comm_long_all
                                } (${row?.pct_of_oi_comm_long_all ?? 0}%)`
                              : ""}
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor:
                                row?.change_in_comm_short_all > 0
                                  ? "#67bd90"
                                  : row?.change_in_comm_short_all < 0
                                  ? "#f18682"
                                  : "transparent",
                            }}
                            className="custom-table-cell"
                          >
                            {row?.change_in_comm_short_all
                              ? `${
                                  row.change_in_comm_short_all > 0 ? "+" : ""
                                }${row.change_in_comm_short_all} (${
                                  row?.pct_of_oi_comm_short_all ?? 0
                                }%)`
                              : ""}
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor:
                                row?.change_in_tot_rept_long_all > 0
                                  ? "#67bd90"
                                  : row?.change_in_tot_rept_long_all < 0
                                  ? "#f18682"
                                  : "transparent",
                            }}
                            className="custom-table-cell"
                          >
                            {row?.change_in_tot_rept_long_all
                              ? `${
                                  row.change_in_tot_rept_long_all > 0 ? "+" : ""
                                }${row.change_in_tot_rept_long_all} (${
                                  row?.pct_of_oi_tot_rept_long_all ?? 0
                                }%)`
                              : ""}
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor:
                                row?.change_in_tot_rept_short > 0
                                  ? "#67bd90"
                                  : row?.change_in_tot_rept_short < 0
                                  ? "#f18682"
                                  : "transparent",
                            }}
                            className="custom-table-cell"
                          >
                            {row?.change_in_tot_rept_short
                              ? `${
                                  row.change_in_tot_rept_short > 0 ? "+" : ""
                                }${row.change_in_tot_rept_short} (${
                                  row?.pct_of_oi_tot_rept_short ?? 0
                                }%)`
                              : ""}
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor:
                                row?.change_in_nonrept_long_all > 0
                                  ? "#67bd90"
                                  : row?.change_in_nonrept_long_all < 0
                                  ? "#f18682"
                                  : "transparent",
                            }}
                            className="custom-table-cell"
                          >
                            {row?.change_in_nonrept_long_all
                              ? `${
                                  row.change_in_nonrept_long_all > 0 ? "+" : ""
                                }${row.change_in_nonrept_long_all} (${
                                  row?.pct_of_oi_nonrept_long_all ?? 0
                                }%)`
                              : ""}
                          </TableCell>
                          <TableCell
                            style={{
                              backgroundColor:
                                row?.change_in_nonrept_short_all > 0
                                  ? "#67bd90"
                                  : row?.change_in_nonrept_short_all < 0
                                  ? "#f18682"
                                  : "transparent",
                            }}
                            className="custom-table-cell"
                          >
                            {row?.change_in_nonrept_short_all
                              ? `${
                                  row.change_in_nonrept_short_all > 0 ? "+" : ""
                                }${row.change_in_nonrept_short_all} (${
                                  row?.pct_of_oi_nonrept_short_all ?? 0
                                }%)`
                              : ""}
                          </TableCell>
                        </>
                      )}
                    </TableRow>

                    {/* Third Row: Change Values */}
                    <TableRow className="third-row-table">
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          fontSize: "15px",
                        }}
                        className="custom-table-cell"
                      >
                        {netChange && "Change : "}
                        {netChange > 0 && (
                          <div className="positive-change">
                            <span className="arrow up">▲</span>
                            {new Intl.NumberFormat("en-US").format(netChange)}
                          </div>
                        )}
                        {netChange < 0 && (
                          <div className="negative-change">
                            <span className="arrow down">▼</span>
                            {new Intl.NumberFormat("en-US").format(netChange)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="custom-table-cell">
                        {row?.traders_noncomm_long_all}
                      </TableCell>
                      <TableCell className="custom-table-cell">
                        {row?.traders_noncomm_short_all}
                      </TableCell>
                      <TableCell className="custom-table-cell">
                        {row?.traders_noncomm_spread_all}
                      </TableCell>
                      {isChecked && (
                        <>
                          <TableCell className="custom-table-cell">
                            {row?.traders_comm_long_all}
                          </TableCell>
                          <TableCell className="custom-table-cell">
                            {row?.traders_comm_short_all}
                          </TableCell>
                          <TableCell className="custom-table-cell">
                            {row?.traders_tot_rept_long_all}
                          </TableCell>
                          <TableCell className="custom-table-cell">
                            {row?.traders_tot_rept_short_all}
                          </TableCell>
                          <TableCell
                            colSpan={2}
                            style={{ fontWeight: "bold" }}
                            className="custom-table-cell"
                          >
                            <span>Total Traders : {row?.traders_tot_all}</span>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}

      {selectedSubCategory && !loading && data.length === 0 && (
        <p>No data available for the selected filter.</p>
      )}

      <Box
        sx={{
          backgroundColor: "#f1f1f1",
          textAlign: "center",
          padding: "20px 0",
          marginTop: "auto",
        }}
      >
        <Typography variant="body2">
          &copy; 2024 A2Alpha Tech. All rights reserved.{" "}
          <a
            href="https://a2alphatech.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit our website
          </a>
        </Typography>
      </Box>
    </div>
  );
};

export default App;

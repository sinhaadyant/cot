import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import "./App.css"; // Import the custom CSS file

export const filterOptions = {
  commodity: [
    "GOLD - COMMODITY EXCHANGE INC.",
    "SILVER - COMMODITY EXCHANGE INC.",
  ],
  crypto: ["BITCOIN - CHICAGO MERCANTILE EXCHANGE"],
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
};

const App = () => {
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);

  // Fetch data based on selected subcategory
  const fetchData = async (filter, limit) => {
    setLoading(true);
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

  const loadMore = () => {
    const newLimit = limit + 5;
    setLimit(newLimit);
    fetchData(selectedSubCategory, newLimit);
  };

  useEffect(() => {
    // Fetch initial data if a filter is selected
    if (selectedSubCategory) {
      fetchData(selectedSubCategory, limit);
    }
  }, [selectedSubCategory, limit]);

  return (
    <div className="app-container">
      <h1>Exchange Data</h1>

      <div className="filter-container">
        <label htmlFor="filter" className="filter-label">
          Filter by Exchange:
        </label>
        <Select
          id="filter"
          value={selectedFilter}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <MenuItem value="">Select Category</MenuItem>
          <MenuItem value="commodity">Commodity</MenuItem>
          <MenuItem value="crypto">Crypto</MenuItem>
          <MenuItem value="currencies">Currencies</MenuItem>
        </Select>

        {selectedFilter && (
          <>
            <label htmlFor="subCategory" className="filter-label">
              Subcategory:
            </label>
            <Select
              id="subCategory"
              value={selectedSubCategory}
              onChange={handleSubCategoryChange}
              className="filter-select"
              disabled={subCategoryOptions.length === 0}
            >
              <MenuItem value="">Select Subcategory</MenuItem>
              {subCategoryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </>
        )}
      </div>

      {loading && <CircularProgress className="loading-spinner" />}

      {data.length > 0 && (
        <>
          <Table className="data-table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell colSpan={3}>Non-Commercial</TableCell>
                <TableCell colSpan={2}>Commercial</TableCell>
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell colSpan={2}>Non-Reportable</TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Long</TableCell>
                <TableCell>Short</TableCell>
                <TableCell>Spreads</TableCell>
                <TableCell>Long</TableCell>
                <TableCell>Short</TableCell>
                <TableCell>Long</TableCell>
                <TableCell>Short</TableCell>
                <TableCell>Long</TableCell>
                <TableCell>Short</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {row?.report_date_as_yyyy_mm_dd
                      ? new Date(
                          row?.report_date_as_yyyy_mm_dd
                        ).toLocaleDateString("en-CA")
                      : ""}
                  </TableCell>
                  <TableCell>
                    {row?.noncomm_positions_long_all
                      ? new Intl.NumberFormat("en-US").format(
                          row.noncomm_positions_long_all
                        )
                      : ""}
                  </TableCell>
                  <TableCell>
                    {row?.noncomm_positions_short_all
                      ? new Intl.NumberFormat("en-US").format(
                          row.noncomm_positions_short_all
                        )
                      : ""}
                  </TableCell>
                  <TableCell>
                    {row?.noncomm_postions_spread_all
                      ? new Intl.NumberFormat("en-US").format(
                          row.noncomm_postions_spread_all
                        )
                      : ""}
                  </TableCell>
                  <TableCell>
                    {row?.comm_positions_long_all
                      ? new Intl.NumberFormat("en-US").format(
                          row.comm_positions_long_all
                        )
                      : ""}
                  </TableCell>
                  <TableCell>
                    {row?.comm_positions_short_all
                      ? new Intl.NumberFormat("en-US").format(
                          row.comm_positions_short_all
                        )
                      : ""}
                  </TableCell>
                  <TableCell>
                    {row?.tot_rept_positions_long_all
                      ? new Intl.NumberFormat("en-US").format(
                          row.tot_rept_positions_long_all
                        )
                      : ""}
                  </TableCell>
                  <TableCell>
                    {row?.tot_rept_positions_short
                      ? new Intl.NumberFormat("en-US").format(
                          row.tot_rept_positions_short
                        )
                      : ""}
                  </TableCell>
                  <TableCell>
                    {row?.nonrept_positions_long_all
                      ? new Intl.NumberFormat("en-US").format(
                          row.nonrept_positions_long_all
                        )
                      : ""}
                  </TableCell>
                  <TableCell>
                    {row?.nonrept_positions_short_all
                      ? new Intl.NumberFormat("en-US").format(
                          row.nonrept_positions_short_all
                        )
                      : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="load-more-container">
            <Button
              variant="contained"
              onClick={loadMore}
              className="load-more-button"
            >
              Load More
            </Button>
          </div>
        </>
      )}

      {selectedSubCategory && !loading && data.length === 0 && (
        <p>No data available for the selected filter.</p>
      )}
    </div>
  );
};

export default App;

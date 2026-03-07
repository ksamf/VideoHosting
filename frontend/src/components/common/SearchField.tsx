import { useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation, useNavigate } from "react-router-dom";
import { commonSx } from "../../styles/sx/common";

export default function SearchField() {
  const [query, setQuery] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });
  const navigate = useNavigate();
  const location = useLocation();

  const goToSearch = () => {
    const q = query.trim();
    if (q.length < 2) return;
    const next = `/search?q=${encodeURIComponent(q)}`;
    const current = `${location.pathname}${location.search}`;
    if (current !== next) {
      navigate(next);
    }
  };

  return (
    <TextField
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          goToSearch();
        }
      }}
      placeholder="Поиск"
      sx={commonSx.searchField}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={goToSearch} edge="start">
                <SearchIcon sx={(theme) => ({ ...commonSx.searchIcon(theme), fontSize: { xs: 20, sm: 22 } })} />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}


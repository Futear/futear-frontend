import AutocompleteBase from "./base-autocomplete";

export default function NationalTeamAutocomplete(props) {
  return (
    <AutocompleteBase
      {...props}
      cachedItems={props.cachedNationalTeams}
      fetchFn={props.fetchTeams}
      onSelect={props.onSelect}
      getItemLabel={(t) => t.name}
      getItemImage={(t) => t.logoUrl}
      getItemMeta={(t) => t.confederation || "Selección"}
    />
  );
}

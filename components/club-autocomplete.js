import AutocompleteBase from "./base-autocomplete";

export default function ClubAutocomplete(props) {
  return (
    <AutocompleteBase
      {...props}
      cachedItems={props.cachedClubs}
      fetchFn={props.fetchClubs}
      onSelect={props.onSelect}
      getItemLabel={(c) => c.shortName}
      getItemImage={(c) => c.logoUrl}
      getItemMeta={(c) => c.country || "Club"}
    />
  );
}

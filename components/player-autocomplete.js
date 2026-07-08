import AutocompleteBase from "./base-autocomplete";

export default function PlayerAutocomplete(props) {
  return (
    <AutocompleteBase
      {...props}
      cachedItems={props.cachedPlayers}
      fetchFn={props.fetchPlayers}
      onSelect={props.onPlayerSelect}
      getItemLabel={(p) => p.shortName}
      getItemImage={(p) => p.profileImage}
      getItemMeta={(p) => {
        const positions = p.positions || [];
        const nationality = p.nationality?.name;

        return [positions.join(", "), nationality].filter(Boolean).join(" • ");
      }}
    />
  );
}

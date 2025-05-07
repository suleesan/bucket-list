import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";

const BucketListItem = ({
  item,
  creators,
  upvoters,
  dateSuggestionUsers,
  currentUser,
  onEdit,
  onUpvote,
  onRemoveUpvote,
  openSuggestDateDialog,
  handleVoteForDate,
}) => {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(45deg, #F0F8FF 30%, #b8e0f7 90%)",
        height: "100%",
        "&:hover": {
          transform: "translateY(-4px)",
          transition: "transform 0.2s",
        },
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{ color: "#5D8AA8", fontWeight: "bold" }}
              >
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {creators[item.id]?.username || "Unknown"}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onEdit(item)}
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  color: "primary.dark",
                },
              }}
            >
              Edit
            </Button>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<LocationOnIcon />}
              label={item.location}
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip
              icon={<EventIcon />}
              label={item.date}
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          </Box>
          <Typography color="text.secondary" paragraph>
            {item.description}
          </Typography>
          {item.dateSuggestions?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Date Suggestions:
              </Typography>
              {item.dateSuggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={
                    <>
                      {suggestion.date} ({suggestion.votes.length} votes)
                      {suggestion.suggestedBy &&
                      dateSuggestionUsers[suggestion.suggestedBy]?.username
                        ? ` • ${
                            dateSuggestionUsers[suggestion.suggestedBy].username
                          }`
                        : ""}
                    </>
                  }
                  onClick={() => handleVoteForDate(item.id, index)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
        </Box>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => openSuggestDateDialog(item.id)}
          sx={{
            borderColor: "primary.main",
            color: "primary.main",
            "&:hover": {
              borderColor: "primary.dark",
              color: "primary.dark",
            },
            mt: "auto",
          }}
        >
          Suggest Date
        </Button>
        <Box>
          <Button
            startIcon={
              item.upvotes?.includes(currentUser.uid) ? (
                <ThumbUpIcon />
              ) : (
                <ThumbUpOutlinedIcon />
              )
            }
            onClick={async () => {
              if (item.upvotes?.includes(currentUser.uid)) {
                await onRemoveUpvote(item.id, currentUser.uid);
              } else {
                await onUpvote(item.id, currentUser.uid);
              }
            }}
          >
            {item.upvotes?.length || 0}
          </Button>
          {upvoters[item.id]?.map((user) => (
            <Typography key={user.id} variant="caption" sx={{ mr: 1 }}>
              {user.username}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default BucketListItem;


module.exports = function() {
	this.GetSecondsSinceUTCTimestamp = getSecondsSinceUTCTimestamp;
};

function getSecondsSinceUTCTimestamp(utcTimestamp)
{
	return (Date.now() - new Date(utcTimestamp * 1000).getTime()) / 1000;
}